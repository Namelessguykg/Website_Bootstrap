document.querySelectorAll("[data-product-filter-page]").forEach((page) => {
  const form = page.querySelector("#product-filter-form");
  const grid = page.querySelector("[data-product-grid]");
  const count = page.querySelector("[data-product-count]");
  const emptyState = page.querySelector("[data-empty-state]");

  if (!form || !grid || !count || !emptyState) {
    return;
  }

  const products = Array.from(grid.querySelectorAll("[data-filter-product]"));
  const originalOrder = new Map(products.map((product, index) => [product, index]));
  const controls = {
    category: form.elements.namedItem("category"),
    type: form.elements.namedItem("type"),
    color: form.elements.namedItem("color"),
    minPrice: form.elements.namedItem("minPrice"),
    maxPrice: form.elements.namedItem("maxPrice"),
    search: form.elements.namedItem("search"),
    sort: form.elements.namedItem("sort"),
  };

  const applyFilters = () => {
    const category = controls.category.value.toLowerCase();
    const type = controls.type.value.toLowerCase();
    const color = controls.color.value.toLowerCase();
    const search = controls.search.value.trim().toLowerCase();
    const minPrice = controls.minPrice.value === "" ? null : Number(controls.minPrice.value);
    const maxPrice = controls.maxPrice.value === "" ? null : Number(controls.maxPrice.value);

    const visibleProducts = products.filter((product) => {
      const priceValue = product.dataset.price;
      const price = priceValue === "" ? null : Number(priceValue);
      const matchesPrice = (minPrice === null && maxPrice === null)
        || (price !== null
          && (minPrice === null || price >= minPrice)
          && (maxPrice === null || price <= maxPrice));

      return (!category || product.dataset.category === category)
        && (!type || product.dataset.type === type)
        && (!color || product.dataset.colors.split(",").includes(color))
        && (!search || product.dataset.name.includes(search))
        && matchesPrice;
    });

    const sortDirection = controls.sort.value;
    visibleProducts.sort((first, second) => {
      const firstPrice = first.dataset.price === "" ? null : Number(first.dataset.price);
      const secondPrice = second.dataset.price === "" ? null : Number(second.dataset.price);

      if (firstPrice === null || secondPrice === null) {
        if (firstPrice === secondPrice) {
          return originalOrder.get(first) - originalOrder.get(second);
        }
        return firstPrice === null ? 1 : -1;
      }

      if (sortDirection === "price-ascending") {
        return firstPrice - secondPrice;
      }
      if (sortDirection === "price-descending") {
        return secondPrice - firstPrice;
      }
      return originalOrder.get(first) - originalOrder.get(second);
    });

    products.forEach((product) => product.classList.add("d-none"));
    visibleProducts.forEach((product) => {
      product.classList.remove("d-none");
      grid.append(product);
    });

    count.textContent = `Showing ${visibleProducts.length} of ${products.length} products`;
    emptyState.classList.toggle("d-none", visibleProducts.length > 0);
  };

  form.addEventListener("input", applyFilters);
  form.addEventListener("change", applyFilters);
  form.addEventListener("reset", () => requestAnimationFrame(applyFilters));
  applyFilters();
});
