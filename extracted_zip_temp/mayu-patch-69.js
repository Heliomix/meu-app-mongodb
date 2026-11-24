/* Mayu 6.9 — retirar e reativar produtos somente na lista do Delivery */
if (!window.__mayu69DeliveryCatalogInstalled && typeof renderOrderBuilder === "function") {
  window.__mayu69DeliveryCatalogInstalled = true;
  window.__mayu69ShowArchived = false;

  const __mayu69OriginalRenderOrderBuilder = renderOrderBuilder;
  renderOrderBuilder = function () {
    const allProducts = products;
    const showArchived = !!window.__mayu69ShowArchived;
    const visibleProducts = allProducts.filter(product => showArchived
      ? product && product.deliveryActive === false
      : product && product.deliveryActive !== false);
    products = visibleProducts;
    if (builderIndex >= visibleProducts.length) builderIndex = Math.max(0, visibleProducts.length - 1);
    try {
      __mayu69OriginalRenderOrderBuilder.apply(this, arguments);
    } finally {
      products = allProducts;
    }

    const filters = document.querySelector(".builder-smart-filters");
    if (filters) {
      let archiveButton = document.getElementById("mayu69ArchivedToggle");
      if (!archiveButton) {
        archiveButton = document.createElement("button");
        archiveButton.type = "button";
        archiveButton.id = "mayu69ArchivedToggle";
        archiveButton.className = "builder-filter mayu69-archived-toggle";
        filters.appendChild(archiveButton);
        archiveButton.addEventListener("click", () => {
          window.__mayu69ShowArchived = !window.__mayu69ShowArchived;
          builderIndex = 0;
          renderOrderBuilder();
        });
      }
      const archivedCount = allProducts.filter(product => product && product.deliveryActive === false).length;
      archiveButton.textContent = showArchived ? "← Produtos ativos" : `Itens removidos (${archivedCount})`;
      archiveButton.classList.toggle("active", showArchived);
    }

    const row = $("builderProductList")?.querySelector("[data-builder-id]");
    if (row) {
      const title = row.querySelector(".builder-step-product-title");
      if (title && !title.querySelector("[data-mayu69-delivery-toggle]")) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mayu69-delivery-toggle";
        button.dataset.mayu69DeliveryToggle = "1";
        button.textContent = showArchived ? "Reativar no Delivery" : "Remover do Delivery";
        title.appendChild(button);
      }
    } else if (!visibleProducts.length) {
      const list = $("builderProductList");
      if (list) list.innerHTML = `<div class="empty"><strong>${showArchived ? "Nenhum produto removido." : "Todos os produtos estão fora da lista do Delivery."}</strong>${showArchived ? "Não há itens arquivados para reativar." : "Use Itens removidos para reativar um produto, se necessário."}</div>`;
    }
  };

  $("builderProductList")?.addEventListener("click", event => {
    const button = event.target.closest("[data-mayu69-delivery-toggle]");
    if (!button) return;
    const row = button.closest("[data-builder-id]");
    const product = row && productById(row.dataset.builderId);
    if (!product) return;
    const removing = product.deliveryActive !== false;
    const message = removing
      ? `Remover ${product.name} da lista do Delivery?\n\nO produto continuará cadastrado no estoque e no histórico. Você poderá reativá-lo em “Itens removidos”.`
      : `Reativar ${product.name} na lista do Delivery?`;
    if (!confirm(message)) return;
    product.deliveryActive = !removing;
    if (removing) builderIndex = Math.max(0, builderIndex - 1);
    save();
    renderOrderBuilder();
    showToast(removing ? `${product.name} removido da lista do Delivery.` : `${product.name} reativado no Delivery.`);
  });

  const style = document.createElement("style");
  style.id = "mayu69DeliveryCatalogStyles";
  style.textContent = `
    .mayu69-archived-toggle{border-color:rgba(245,158,11,.45)!important;color:#f6bd4b!important}
    .mayu69-delivery-toggle{border:1px solid rgba(239,100,100,.42);background:rgba(120,30,30,.16);color:#f2a0a0;border-radius:10px;padding:8px 10px;font-size:12px;font-weight:750;line-height:1.2;cursor:pointer;min-height:36px;white-space:nowrap}
    .mayu69-delivery-toggle:hover{background:rgba(120,30,30,.28)}
    .builder-step-product-title{flex-wrap:wrap}
    .mayu69-archived-toggle.active{background:rgba(245,158,11,.14)!important}
    @media(max-width:520px){.mayu69-delivery-toggle{font-size:11px;padding:7px 8px}}
  `;
  document.head.appendChild(style);
}
