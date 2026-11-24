/* Mayu Push Sushi 6.6 — cadastro manual de insumos pelo fluxo de compras */
if (!window.__mayu66Installed) {
  window.__mayu66Installed = true;
  document.title = "Mayu Push Sushi | Premium Inventory 6.6";

  // Mantém o rascunho de compra no armazenamento local e na sincronização existente.
  const __mayu66Snapshot = appSnapshot;
  appSnapshot = function () {
    const data = __mayu66Snapshot.apply(this, arguments);
    data.purchaseDraftItems = purchaseDraftItems;
    data.purchaseDraftVendorId = purchaseDraftVendorId;
    return data;
  };
  function __mayu66RestoreDraft() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      purchaseDraftItems = Array.isArray(data.purchaseDraftItems) ? data.purchaseDraftItems : [];
      purchaseDraftVendorId = data.purchaseDraftVendorId ?? null;
    } catch (_) {}
  }
  const __mayu66Load = load;
  load = function () {
    const result = __mayu66Load.apply(this, arguments);
    __mayu66RestoreDraft();
    return result;
  };
  __mayu66RestoreDraft();

  // Um item cadastrado pelo formulário já foi lançado no estoque.
  // O pedido recebe receivedQty para impedir que o recebimento some a quantidade novamente.
  const __mayu66CreatePurchaseOrder = createPurchaseOrder;
  createPurchaseOrder = function (vendorId, items) {
    const order = __mayu66CreatePurchaseOrder.apply(this, arguments);
    const sourceItems = Array.isArray(items) ? items : [];
    if (order && Array.isArray(order.items)) {
      order.items.forEach((item, index) => {
        const source = sourceItems[index] || {};
        item.receivedQty = Math.min(number(item.qty), Math.max(0, number(source.receivedQty)));
        item.stockAddedImmediately = !!source.stockAddedImmediately;
        item.stockMovementId = source.stockMovementId || "";
      });
      const anyReceived = order.items.some(item => number(item.receivedQty) > 0);
      const allReceived = order.items.length > 0 && order.items.every(item => number(item.receivedQty) + 0.000001 >= number(item.qty));
      if (allReceived) order.status = "received";
      else if (anyReceived) order.status = "partial";
    }
    return order;
  };

  const __mayu66ClearDraft = clearPurchaseDraft;
  clearPurchaseDraft = function () {
    const hadImmediateEntries = purchaseDraftItems.some(item => item.stockAddedImmediately);
    const result = __mayu66ClearDraft.apply(this, arguments);
    const form = $("purchaseNewProductForm");
    if (form) { form.reset(); form.classList.add("hidden"); }
    save();
    if (hadImmediateEntries) showToast("Rascunho limpo. Os produtos já lançados continuam no estoque.");
    return result;
  };

  const __mayu66RenderDraft = renderPurchaseDraft;
  renderPurchaseDraft = function () {
    __mayu66RenderDraft.apply(this, arguments);
    const root = $("purchaseDraftLines");
    if (!root) return;
    root.querySelectorAll(".purchase-draft-line").forEach((line, index) => {
      if (purchaseDraftItems[index]?.stockAddedImmediately) {
        const small = line.querySelector("small");
        if (small && !small.textContent.includes("entrada já lançada")) {
          small.textContent += " · entrada já lançada no estoque";
        }
      }
    });
  };

  function __mayu66AddProduct(event) {
    event.preventDefault();
    if (!isManager()) return showToast("Apenas gerentes podem cadastrar produtos.");

    const name = $("purchaseNewName").value.trim();
    const qty = number($("purchaseNewQty").value);
    const unit = $("purchaseNewUnit").value || "un";
    const category = $("purchaseNewCategory").value || "Diversos";
    const vendorId = $("purchaseManualVendor").value || "";
    const price = number($("purchaseNewPrice").value);

    if (!name || qty <= 0) return showToast("Informe o nome do produto e uma quantidade maior que zero.");
    if (price < 0) return showToast("O preço unitário não pode ser negativo.");
    if (purchaseDraftVendorId !== null && purchaseDraftVendorId !== vendorId) {
      return showToast("Cada pedido deve ter apenas um fornecedor. Salve ou limpe o rascunho antes de trocar.");
    }

    const duplicate = products.find(product => String(product.name || "").trim().toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"));
    if (duplicate) {
      populatePurchaseBuilderSelects();
      $("purchaseManualProduct").value = duplicate.id;
      return showToast("Este produto já existe no estoque. Selecione-o no campo Produto para adicioná-lo ao pedido.");
    }

    const now = new Date().toISOString();
    const productId = uid();
    const movementId = uid();
    products.push({
      id: productId, name, unit, category, stock: qty, min: 0, target: 0,
      dailyUse: 0, coverageDays: 7, orderQty: 0, orderUnit: unit,
      manualOverride: false, vendorId, location: "Não definido", nfeCode: "",
      barcode: "", favorite: false, stockConfigured: true
    });
    movements.push({
      id: movementId, productId, productName: name, type: "entrada", qty, unit,
      unitCost: price, vendorId, date: today(),
      notes: "Entrada imediata por cadastro manual no pedido de compra",
      stockBefore: 0, stockAfter: qty,
      createdBy: currentUser?.username || currentUser?.name || "Equipe", createdAt: now
    });

    if (purchaseDraftVendorId === null) purchaseDraftVendorId = vendorId;
    purchaseDraftItems.push({
      productId, name, qty, unit, unitPrice: price, receivedQty: qty,
      stockAddedImmediately: true, stockMovementId: movementId
    });

    $("purchaseNewName").value = "";
    $("purchaseNewQty").value = "1";
    $("purchaseNewPrice").value = "";
    save();
    renderAll();
    renderPurchaseWorkflow();
    showToast("Produto cadastrado no estoque e adicionado ao pedido. Entrada de " + fmt(qty) + " " + unit + " registrada.");
  }

  const manualForm = $("purchaseManualForm");
  if (manualForm && !$("purchaseNewProductForm")) {
    const unitOptions = $("newUnit")?.innerHTML || '<option value="un">Unidade</option>';
    const categoryOptions = $("newCategory")?.innerHTML || '<option>Diversos</option>';
    manualForm.insertAdjacentHTML("afterend", `
      <div class="purchase-new-product-panel manager-only">
        <button class="btn btn-outline" id="purchaseNewProductToggle" type="button">＋ Cadastrar produto novo no estoque</button>
        <form id="purchaseNewProductForm" class="purchase-new-product-fields hidden">
          <div class="purchase-new-product-intro">Cadastre um insumo que ainda não existe no catálogo. A quantidade informada entrará imediatamente no estoque e ficará marcada no pedido para não ser lançada novamente no recebimento.</div>
          <div class="field"><label for="purchaseNewName">Nome do produto</label><input id="purchaseNewName" required maxlength="70" placeholder="Ex.: Gergelim torrado"></div>
          <div class="field"><label for="purchaseNewUnit">Unidade</label><select id="purchaseNewUnit">${unitOptions}</select></div>
          <div class="field"><label for="purchaseNewCategory">Categoria</label><select id="purchaseNewCategory">${categoryOptions}</select></div>
          <div class="field"><label for="purchaseNewQty">Quantidade que entra no estoque</label><input id="purchaseNewQty" type="number" min="0.001" step="0.001" inputmode="decimal" value="1" required></div>
          <div class="field manager-only"><label for="purchaseNewPrice">Preço unitário estimado (R$)</label><input id="purchaseNewPrice" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Opcional"></div>
          <button class="btn btn-primary" type="submit">＋ Cadastrar e adicionar ao pedido</button>
        </form>
      </div>`);

    const style = document.createElement("style");
    style.textContent = `
      .purchase-new-product-panel{margin-top:12px;padding:14px;border:1px dashed var(--line);border-radius:16px;background:rgba(255,255,255,.025)}
      .purchase-new-product-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px;align-items:end}
      .purchase-new-product-intro{grid-column:1/-1;color:var(--muted);font-size:.84rem;line-height:1.5}
      .purchase-new-product-fields .field{min-width:0}
      .purchase-new-product-fields button{align-self:end}
      @media(max-width:760px){.purchase-new-product-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.purchase-new-product-intro{grid-column:1/-1}.purchase-new-product-fields button{grid-column:1/-1}}
      @media(max-width:460px){.purchase-new-product-fields{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    $("purchaseNewProductToggle").addEventListener("click", () => {
      const form = $("purchaseNewProductForm");
      form.classList.toggle("hidden");
      if (!form.classList.contains("hidden")) $("purchaseNewName").focus();
    });
    $("purchaseNewProductForm").addEventListener("submit", __mayu66AddProduct);

    // O formulário de item existente e os botões de remoção também salvam o rascunho.
    manualForm.addEventListener("submit", () => save());
    const draftRoot = $("purchaseDraftLines");
    if (draftRoot) draftRoot.addEventListener("click", event => {
      if (event.target.closest("[data-purchase-draft-remove]")) save();
    });
    if (typeof applyRolePermissions === "function") applyRolePermissions();
    if (typeof renderPurchaseWorkflow === "function") renderPurchaseWorkflow();
  }
}

/* Mayu 6.7 — fechamento automático e persistente de pedidos completos */
if (!window.__mayu67OrderFinalizeInstalled) {
  window.__mayu67OrderFinalizeInstalled = true;
  document.title = "Mayu Push Sushi | Premium Inventory 6.7";

  function __mayu67NormalizePurchaseOrders() {
    let changed = false;
    const now = new Date().toISOString();
    (purchaseOrders || []).forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      if (!items.length) return;
      const complete = items.every(item => {
        const requested = number(item.qty);
        return requested <= 0 || number(item.receivedQty) + 0.000001 >= requested;
      });
      const anyReceived = items.some(item => number(item.receivedQty) > 0);
      let nextStatus = order.status;
      if (complete && items.some(item => number(item.qty) > 0)) nextStatus = "received";
      else if (anyReceived && ["draft", "approved", "ordered"].includes(order.status)) nextStatus = "partial";
      if (nextStatus !== order.status) {
        const previous = order.status || "draft";
        order.status = nextStatus;
        order.updatedAt = now;
        order.updatedBy = currentUser?.username || currentUser?.name || "";
        if (nextStatus === "received") order.receivedAt = order.receivedAt || now;
        if (typeof logPurchaseAudit === "function") {
          logPurchaseAudit(order, nextStatus === "received" ? "received" : "partial",
            nextStatus === "received"
              ? "Pedido concluído automaticamente: todos os itens foram recebidos."
              : "Pedido atualizado para recebimento parcial.");
        }
        changed = true;
      } else if (order.status === "received") {
        order.receivedAt = order.receivedAt || order.updatedAt || now;
      }
    });
    if (changed) save();
    return changed;
  }

  const __mayu67RenderPurchaseOrders = renderPurchaseOrders;
  renderPurchaseOrders = function () {
    __mayu67NormalizePurchaseOrders();
    __mayu67RenderPurchaseOrders.apply(this, arguments);
    const filter = $("purchaseOrderFilter");
    const receivedOption = filter?.querySelector('option[value="received"]');
    if (receivedOption) receivedOption.textContent = "Concluídos";
    const kpis = $("purchaseWorkflowKpis");
    if (kpis) kpis.querySelectorAll(".consumption-kpi span").forEach(node => {
      if (node.textContent.trim() === "Recebidos") node.textContent = "Concluídos";
    });
  };

  const __mayu67PurchaseStatusLabel = purchaseStatusLabel;
  purchaseStatusLabel = function (status) {
    return status === "received" ? "Concluído" : __mayu67PurchaseStatusLabel(status);
  };

  const __mayu67ConfirmPurchaseReceipt = confirmPurchaseReceipt;
  confirmPurchaseReceipt = function () {
    const orderId = activeReceivingPurchaseId;
    const result = __mayu67ConfirmPurchaseReceipt.apply(this, arguments);
    const order = (purchaseOrders || []).find(item => item.id === orderId);
    if (order) {
      const items = Array.isArray(order.items) ? order.items : [];
      const complete = items.length > 0 && items.some(item => number(item.qty) > 0) && items.every(item =>
        number(item.qty) <= 0 || number(item.receivedQty) + 0.000001 >= number(item.qty)
      );
      if (complete && order.status !== "received") {
        order.status = "received";
        order.receivedAt = order.receivedAt || new Date().toISOString();
        order.updatedAt = new Date().toISOString();
        order.updatedBy = currentUser?.username || currentUser?.name || "";
        if (typeof logPurchaseAudit === "function") {
          logPurchaseAudit(order, "received", "Pedido concluído: todos os itens foram recebidos.");
        }
        closePurchaseReceiveModal();
        save();
        renderAll();
        showToast("Pedido " + (order.code || "") + " concluído. Estoque atualizado e pedido arquivado no histórico.");
      }
    }
    return result;
  };

  // Corrige também pedidos antigos que já tinham todas as quantidades recebidas.
  __mayu67NormalizePurchaseOrders();
  if (typeof renderPurchaseOrders === "function") renderPurchaseOrders();
}

/* Mayu 6.8 — permitir concluir o assistente sem gerar pedido vazio */
if (!window.__mayu68BuilderFinalizeInstalled) {
  window.__mayu68BuilderFinalizeInstalled = true;
  const confirmBuilderButton = $("confirmOrderBuilderBtn");
  if (confirmBuilderButton) {
    confirmBuilderButton.addEventListener("click", event => {
      try {
        const counted = products.some(p => {
          const d = orderDraft[p.id];
          return d && d.stockTouched === true && d.stockQty !== undefined && d.stockQty !== null &&
            String(d.stockQty).trim() !== "" && number(d.stockQty) >= 0 &&
            String(d.unit || p.unit || "un").toLowerCase() === String(p.unit || "un").toLowerCase();
        });
        const selected = products.some(p => {
          const d = orderDraft[p.id];
          const difference = builderPurchaseQty(d);
          return d && d.qty !== undefined && String(d.qty).trim() !== "" &&
            difference !== null && difference > 0 &&
            String(d.unit || p.unit || "un").toLowerCase() === String(p.unit || "un").toLowerCase();
        });
        const invalidUnit = products.some(p => {
          const d = orderDraft[p.id];
          return d && (d.stockTouched === true || number(d.qty) > 0) &&
            String(d.unit || p.unit || "un").toLowerCase() !== String(p.unit || "un").toLowerCase();
        });
        const invalidNeed = products.some(p => {
          const d = orderDraft[p.id];
          return d && d.qty !== undefined && String(d.qty).trim() !== "" && number(d.qty) < 0;
        });
        const invalidStock = products.some(p => {
          const d = orderDraft[p.id];
          return d && d.stockQty !== undefined && String(d.stockQty).trim() !== "" && number(d.stockQty) < 0;
        });
        const missingStock = products.some(p => {
          const d = orderDraft[p.id];
          return d && d.qty !== undefined && String(d.qty).trim() !== "" &&
            (d.stockQty === undefined || d.stockQty === null || String(d.stockQty).trim() === "");
        });

        if (!counted && !selected && !invalidUnit && !invalidNeed && !invalidStock && !missingStock) {
          event.preventDefault();
          event.stopImmediatePropagation();
          closeOrderBuilder();
          showToast("Pedido encerrado. Nenhum item precisa ser comprado; não foi gerada uma compra vazia.");
        }
      } catch (error) {
        console.error("Mayu 6.8: falha ao concluir assistente de compras", error);
      }
    }, true);
  }
}
