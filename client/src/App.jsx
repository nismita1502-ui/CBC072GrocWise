import MarketPrices from "./MarketPrices";

import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import {

  ShoppingBasket,

  Search,

  Heart,

  ShoppingCart,

  Plus,

  Minus,

  Trash2,

  Leaf,

  Wallet,

  Package,

  RefreshCw,

  Bell,

  CheckCircle2,

  AlertCircle,

  ClipboardList,

  LayoutDashboard,

  ListChecks,

  Tag,

  UserRound,
} from "lucide-react";

import "./App.css";
import Login from "./Login";

import SmartPantry, {

  syncPurchasedItemsToPantry,

} from "./SmartPantry";



const API_URL = "http://localhost:5000/api/products";



const categories = [

  "All",

  "Fruits",

  "Vegetables",

  "Dairy",

  "Bakery",

  "Pantry",

];



const priorities = ["Essential", "Important", "Optional"];



const priorityColors = {

  Essential: "#e5f4e8",

  Important: "#fff0d8",

  Optional: "#f0e9ff",

};



const currency = (amount) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(amount);



export default function App() {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [cart, setCart] = useState([]);
const [priceChanges, setPriceChanges] = useState([]);
const [checkingPrices, setCheckingPrices] = useState(false);
  const [favorites, setFavorites] = useState([]);

const [shoppingList, setShoppingList] = useState(() => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("grocwise_shopping_lists_v1") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.map((item) => ({
      ...item,
      id: item.id || `list-${Date.now()}-${Math.random()}`,
      name: item.name || "",
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      priority: ["Essential", "Important", "Optional"].includes(item.priority)
        ? item.priority
        : "Essential",
      checked: Boolean(item.checked),
    }));
  } catch {
    return [];
  }
});
function showToast(message) {
  setToast(message);
}

function addShoppingListItem() {
  const name = listItemName.trim();
  const quantity = Number(listItemQuantity);

  if (!name) {
    showToast("Please enter an item name.");
    return;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    showToast("Please enter a quantity greater than zero.");
    return;
  }

  const newItem = {
    id: `list-${Date.now()}-${Math.random()}`,
    name,
    quantity,
    priority: listItemPriority,
    checked: false,
  };

  setShoppingList((previous) => [newItem, ...previous]);
  setListItemName("");
  setListItemQuantity("1");
  setListItemPriority("Essential");
  showToast(`${name} added to your shopping list.`);
}

function toggleShoppingListItem(id) {
  setShoppingList((previous) =>
    previous.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
  );
}

function deleteShoppingListItem(id) {
  setShoppingList((previous) =>
    previous.filter((item) => item.id !== id)
  );
}

const [listItemName, setListItemName] = useState("");
const [listItemQuantity, setListItemQuantity] = useState("1");
const [listItemPriority, setListItemPriority] = useState("Essential");

  const [budget, setBudget] = useState(1500);

  const [budgetInput, setBudgetInput] = useState("1500");

  const [cartOpen, setCartOpen] = useState(false);

  const [activePage, setActivePage] = useState("Shop");

  const [toast, setToast] = useState("");

  const [orders, setOrders] = useState(() => {

    try {

      return JSON.parse(

        localStorage.getItem("grocwise_demo_orders") || "[]"

      );

    } catch {

      return [];

    }

  });



  useEffect(() => {

    loadProducts();

  }, []);
  



  useEffect(() => {

    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3000);

    return () => clearTimeout(timer);

  }, [toast]);



  async function loadProducts() {

    setLoading(true);

    setApiError("");



    try {

      const response = await axios.get(API_URL);

      const data = response.data;



      if (!data.success || !Array.isArray(data.products)) {

        throw new Error("Unexpected product API response.");

      }



      setProducts(

        data.products.map((product) => ({

          ...product,

          id: product._id,

          price: Number(product.price),

          name: product.name || "Unnamed product",

          category: product.category || "Pantry",

          tag: product.tag || "",

          emoji: product.emoji || "🛒",

          color: product.color || "#f3f5f0",

          inStock: product.inStock !== false,

        }))

      );

    } catch (error) {

      console.error("Unable to load products:", error);

      setApiError(

        "Products could not be loaded. Check that your backend is running on port 5000."

      );

    } finally {

      setLoading(false);

    }

  }



  const filteredProducts = useMemo(() => {

    const query = search.trim().toLowerCase();



    return products.filter((product) => {

      const matchesCategory =

        category === "All" || product.category === category;



      const matchesSearch =

        product.name.toLowerCase().includes(query) ||

        product.category.toLowerCase().includes(query);



      return matchesCategory && matchesSearch;

    });

  }, [products, category, search]);

const smartSuggestions = useMemo(() => {
  const purchaseCounts = {};

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = String(item.name || "").trim().toLowerCase();

      if (!name) return;

      if (!purchaseCounts[name]) {
        purchaseCounts[name] = {
          count: 0,
          quantity: 0,
        };
      }

      // Count the number of separate orders containing this item.
      purchaseCounts[name].count += 1;
      purchaseCounts[name].quantity += Number(item.quantity || 0);
    });
  });

  return products
    .filter((product) => product.inStock)
    .map((product) => {
      const name = String(product.name || "").trim().toLowerCase();

      return {
        ...product,
        previousOrders: purchaseCounts[name]?.count || 0,
        previousQuantity: purchaseCounts[name]?.quantity || 0,
      };
    })
    .filter((product) => product.previousOrders > 0)
    .sort(
      (a, b) =>
        b.previousOrders - a.previousOrders ||
        b.previousQuantity - a.previousQuantity
    )
    .slice(0, 4);
}, [orders, products]);

  const cartCount = cart.reduce(

    (total, item) => total + item.quantity,

    0

  );



  const cartTotal = cart.reduce(

    (total, item) => total + item.price * item.quantity,

    0

  );



  const remainingBudget = budget - cartTotal;



  const priorityTotals = useMemo(() => {

    return priorities.reduce((result, priority) => {

      result[priority] = cart

        .filter((item) => item.priority === priority)

        .reduce(

          (total, item) => total + item.price * item.quantity,

          0

        );



      return result;

    }, {});

  }, [cart]);



  const optionalSavings = priorityTotals.Optional || 0;

  const importantSavings = priorityTotals.Important || 0;



  function showToast(message) {

    setToast(message);

  }
function findPantryMatch(product) {
  try {
    const savedPantry = localStorage.getItem("grocwise_demo_pantry_v1");

    if (!savedPantry) return null;

    const pantryData = JSON.parse(savedPantry);
    const pantryItems = Array.isArray(pantryData.items)
      ? pantryData.items
      : [];

    const productName = String(product.name || "").trim().toLowerCase();

    return (
      pantryItems.find((item) => {
        const pantryName = String(item.name || "")
          .trim()
          .toLowerCase();

        const sameName = pantryName === productName;
        const sameUnit =
          !product.unit ||
          !item.unit ||
          String(product.unit).toLowerCase() ===
            String(item.unit).toLowerCase();

        return sameName && sameUnit && Number(item.quantity) > 0;
      }) || null
    );
  } catch (error) {
    console.error("Could not check pantry availability:", error);
    return null;
  }
}


  function addToCart(product) {

    if (!product.inStock) {

      showToast("This product is currently out of stock.");

      return;

    }
const pantryMatch = findPantryMatch(product);


    setCart((previous) => {

      const existing = previous.find(

        (item) => item.id === product.id

      );



      if (existing) {

        return previous.map((item) =>

          item.id === product.id

            ? { ...item, quantity: item.quantity + 1 }

            : item

        );

      }



      return [

        ...previous,

        {

          ...product,

          quantity: 1,

          priority: "Essential",

        },

      ];

    });



    if (pantryMatch) {
  const availableQuantity = Number(pantryMatch.quantity);
  const unit = pantryMatch.unit || product.unit || "units";

  showToast(
    `Pantry warning: You already have ${availableQuantity} ${unit} of ${product.name} at home. You can still order more.`
  );
} else {
  showToast(`${product.name} added to your cart.`);
}

  }



  function changeQuantity(id, change) {

    setCart((previous) =>

      previous

        .map((item) =>

          item.id === id

            ? { ...item, quantity: item.quantity + change }

            : item

        )

        .filter((item) => item.quantity > 0)

    );

  }



  function removeFromCart(id) {

    setCart((previous) =>

      previous.filter((item) => item.id !== id)

    );

  }



  function updatePriority(id, priority) {

    setCart((previous) =>

      previous.map((item) =>

        item.id === id ? { ...item, priority } : item

      )

    );

  }



  function toggleFavorite(id) {

    setFavorites((previous) =>

      previous.includes(id)

        ? previous.filter((itemId) => itemId !== id)

        : [...previous, id]

    );

  }



  function saveBudget() {

    const amount = Number(budgetInput);



    if (!Number.isFinite(amount) || amount < 0) {

      showToast("Enter a valid budget.");

      return;

    }



    setBudget(amount);

    showToast("Your shopping budget has been updated.");

  }



  function sortCartByPriority() {

    const priorityOrder = {

      Essential: 0,

      Important: 1,

      Optional: 2,

    };



    setCart((previous) =>

      [...previous].sort(

        (a, b) =>

          priorityOrder[a.priority] - priorityOrder[b.priority]

      )

    );

  }

async function placeOrder() {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  setCheckingPrices(true);

  try {
    // Fetch the latest prices from the existing product API.
    const response = await axios.get(API_URL);
    const data = response.data;

    if (!data.success || !Array.isArray(data.products)) {
      throw new Error("Could not verify the latest product prices.");
    }

    const latestById = new Map(
      data.products.map((product) => [
        String(product._id),
        Number(product.price),
      ])
    );

    const changes = [];
    const refreshedCart = cart.map((item) => {
      const latestPrice = latestById.get(String(item.id));

      if (!Number.isFinite(latestPrice) || latestPrice < 0) {
        throw new Error(`Could not verify the price of ${item.name}.`);
      }

      if (latestPrice !== Number(item.price)) {
        changes.push({
          id: item.id,
          name: item.name,
          oldPrice: Number(item.price),
          newPrice: latestPrice,
          quantity: item.quantity,
        });
      }

      return { ...item, price: latestPrice };
    });

    // Update product prices across the Shop page too.
    setProducts((previous) =>
      previous.map((product) => {
        const latestPrice = latestById.get(String(product.id));
        return latestPrice === undefined
          ? product
          : { ...product, price: latestPrice };
      })
    );

    // If prices changed, update the cart and ask the customer to review.
    if (changes.length > 0) {
      setCart(refreshedCart);
      setPriceChanges(changes);
      showToast("Prices changed. Review the updated cart before ordering.");
      return;
    }

    // No price changes: continue with the existing demo checkout.
    syncPurchasedItemsToPantry(
      cart.map((item) => ({
        name: item.name,
        category: item.category,
        unit: item.unit || item.unitOfMeasure || "pcs",
        quantity: Number(item.quantity || 0),
      }))
    );

    const order = {
      id: `GW-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: refreshedCart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        priority: item.priority,
      })),
      total: refreshedCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    };

    const updatedOrders = [order, ...orders];

    localStorage.setItem(
      "grocwise_demo_orders",
      JSON.stringify(updatedOrders)
    );

    setOrders(updatedOrders);
    setCart([]);
    setPriceChanges([]);
    setCartOpen(false);
    setActivePage("My Orders");
    showToast("Demo order placed! Smart Pantry updated.");
  } catch (error) {
    console.error("Price verification or checkout failed:", error);
    showToast(
      error.message || "Could not verify prices. Please try again."
    );
  } finally {
    setCheckingPrices(false);
  }
}

async function placeOrder() {
  if (cart.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  setCheckingPrices(true);

  try {
    // Fetch the latest prices from the existing product API.
    const response = await axios.get(API_URL);
    const data = response.data;

    if (!data.success || !Array.isArray(data.products)) {
      throw new Error("Could not verify the latest product prices.");
    }

    const latestById = new Map(
      data.products.map((product) => [
        String(product._id),
        Number(product.price),
      ])
    );

    const changes = [];
    const refreshedCart = cart.map((item) => {
      const latestPrice = latestById.get(String(item.id));

      if (!Number.isFinite(latestPrice) || latestPrice < 0) {
        throw new Error(`Could not verify the price of ${item.name}.`);
      }

      if (latestPrice !== Number(item.price)) {
        changes.push({
          id: item.id,
          name: item.name,
          oldPrice: Number(item.price),
          newPrice: latestPrice,
          quantity: item.quantity,
        });
      }

      return { ...item, price: latestPrice };
    });

    // Update product prices across the Shop page too.
    setProducts((previous) =>
      previous.map((product) => {
        const latestPrice = latestById.get(String(product.id));
        return latestPrice === undefined
          ? product
          : { ...product, price: latestPrice };
      })
    );

    // If prices changed, update the cart and ask the customer to review.
    if (changes.length > 0) {
      setCart(refreshedCart);
      setPriceChanges(changes);
      showToast("Prices changed. Review the updated cart before ordering.");
      return;
    }

    // No price changes: continue with the existing demo checkout.
    syncPurchasedItemsToPantry(
      cart.map((item) => ({
        name: item.name,
        category: item.category,
        unit: item.unit || item.unitOfMeasure || "pcs",
        quantity: Number(item.quantity || 0),
      }))
    );

    const order = {
      id: `GW-${Date.now()}`,
      date: new Date().toLocaleString(),
      items: refreshedCart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        priority: item.priority,
      })),
      total: refreshedCart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    };

    const updatedOrders = [order, ...orders];

    localStorage.setItem(
      "grocwise_demo_orders",
      JSON.stringify(updatedOrders)
    );

    setOrders(updatedOrders);
    setCart([]);
    setPriceChanges([]);
    setCartOpen(false);
    setActivePage("My Orders");
    showToast("Demo order placed! Smart Pantry updated.");
  } catch (error) {
    console.error("Price verification or checkout failed:", error);
    showToast(
      error.message || "Could not verify prices. Please try again."
    );
  } finally {
    setCheckingPrices(false);
  }
}
  const buttonStyle = {

    border: "none",

    borderRadius: 10,

    padding: "10px 14px",

    background: "#276442",

    color: "#fff",

    fontWeight: 700,

    cursor: "pointer",

    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    gap: 7,

  };



  const outlineButton = {

    ...buttonStyle,

    background: "#fff",

    color: "#276442",

    border: "1px solid #dce6d9",

  };



  const cardStyle = {

    background: "#fff",

    border: "1px solid #e7ece4",

    borderRadius: 16,

    padding: 18,

  };



  const muted = { color: "#788579" };



  const navItems = [

    { name: "Shop", icon: ShoppingBasket },

    { name: "Dashboard", icon: LayoutDashboard },

    { name: "My Pantry", icon: Package },

    { name: "Shopping Lists", icon: ListChecks },

    { name: "Offers & Deals", icon: Tag },

    { name: "Analytics", icon: Wallet },

    { name: "Notifications", icon: Bell },
    { name: "My Orders", icon: ClipboardList },
    { name: "Login", icon: UserRound },
  ];



  return (

    <div

      style={{

        minHeight: "100vh",

        background: "#f7f9f5",

        color: "#25372c",

        fontFamily: "'DM Sans', Arial, sans-serif",

      }}

    >

      <header

        style={{

          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          gap: 14,

          flexWrap: "wrap",

          padding: "16px 24px",

          background: "#fff",

          borderBottom: "1px solid #e8ede5",

          position: "sticky",

          top: 0,

          zIndex: 10,

        }}

      >

        <div

          style={{

            display: "flex",

            alignItems: "center",

            gap: 10,

            fontSize: 23,

            fontWeight: 800,

            color: "#245b3d",

          }}

        >

          <ShoppingBasket size={28} />

          GrocWise

        </div>



        <span style={muted}>

          Shop Smart. Spend Wise. Waste Less.

        </span>



        <button

          style={buttonStyle}

          onClick={() => setCartOpen(true)}

        >

          <ShoppingCart size={17} />

          Cart ({cartCount})

        </button>

      </header>



      <div

        style={{

          display: "grid",

          gridTemplateColumns: "220px minmax(0, 1fr)",

          gap: 0,

        }}

        className="grocwise-main-layout"

      >

        <aside

          style={{

            background: "#fff",

            borderRight: "1px solid #e8ede5",

            padding: 16,

          }}

        >

          <p style={{ ...muted, fontSize: 11, fontWeight: 800 }}>

            MENU

          </p>



          {navItems.map(({ name, icon: Icon }) => (

            <button

              key={name}

              onClick={() => setActivePage(name)}

              style={{

                display: "flex",

                alignItems: "center",

                gap: 10,

                width: "100%",

                padding: "12px 10px",

                marginBottom: 5,

                border: "none",

                borderRadius: 10,

                textAlign: "left",

                cursor: "pointer",

                background:

                  activePage === name ? "#eaf4eb" : "transparent",

                color:

                  activePage === name ? "#245b3d" : "#687569",

                fontWeight: activePage === name ? 700 : 500,

              }}

            >

              <Icon size={17} />

              {name}

            </button>

          ))}

        </aside>



        <main style={{ padding: 24, minWidth: 0 }}>

          {activePage === "Login" ? (
            <section style={cardStyle}>
              <Login
                onLoginSuccess={() => {
                  setActivePage("Dashboard");
                  showToast("Login successful!");
                }}
              />
            </section>
          ) : activePage === "My Pantry" ? (
            <SmartPantry />
          ) : activePage === "Shop" ? (

            <>

              <section

                style={{

                  ...cardStyle,

                  padding: 28,

                  background:

                    "linear-gradient(120deg, #eaf4e5, #f4f6df)",

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: 20,

                  flexWrap: "wrap",

                }}

              >

                <div>

                  <p

                    style={{

                      color: "#39764c",

                      fontWeight: 800,

                      fontSize: 12,

                    }}

                  >

                    FRESH PICKS FOR YOU

                  </p>

                  <h1 style={{ margin: "8px 0", fontSize: 36 }}>

                    Good food. Better choices.

                  </h1>

                  <p style={muted}>

                    Discover groceries, manage your budget, and shop

                    smarter.

                  </p>

                  <button

                    style={buttonStyle}

                    onClick={() =>

                      document

                        .getElementById("grocwise-products")

                        ?.scrollIntoView({ behavior: "smooth" })

                    }

                  >

                    Explore groceries

                  </button>

                </div>

                <div style={{ fontSize: 80 }}>🥬</div>

              </section>



              <section

                style={{

                  display: "grid",

                  gridTemplateColumns:

                    "repeat(auto-fit, minmax(160px, 1fr))",

                  gap: 14,

                  margin: "22px 0",

                }}

              >

                {[

                  {

                    label: "Products available",

                    value: loading ? "…" : products.length,

                    icon: Package,

                  },

                  {

                    label: "Items in cart",

                    value: cartCount,

                    icon: ShoppingCart,

                  },

                  {

                    label: "Cart total",

                    value: currency(cartTotal),

                    icon: Wallet,

                  },

                  {

                    label: "Budget remaining",

                    value: currency(remainingBudget),

                    icon: Leaf,

                  },

                ].map(({ label, value, icon: Icon }) => (

                  <div key={label} style={cardStyle}>

                    <Icon size={22} color="#39764c" />

                    <p style={{ ...muted, fontSize: 13 }}>{label}</p>

                    <h2 style={{ margin: 0 }}>{value}</h2>

                  </div>

                ))}

              </section>



              <section

                style={{

                  ...cardStyle,

                  marginBottom: 22,

                }}

              >

                <h2 style={{ marginTop: 0 }}>My shopping budget</h2>

                <p style={muted}>

                  Set your maximum spending before checkout.

                </p>

                <div

                  style={{

                    display: "flex",

                    gap: 10,

                    flexWrap: "wrap",

                  }}

                >

                  <input

                    type="number"

                    min="0"

                    value={budgetInput}

                    onChange={(event) =>

                      setBudgetInput(event.target.value)

                    }

                    style={{

                      padding: 11,

                      borderRadius: 9,

                      border: "1px solid #dce6d9",

                      maxWidth: 220,

                    }}

                  />

                  <button style={buttonStyle} onClick={saveBudget}>

                    Save budget

                  </button>

                </div>



                <p

                  style={{

                    fontWeight: 700,

                    color: remainingBudget < 0 ? "#b42318" : "#276442",

                  }}

                >

                  {remainingBudget < 0

                    ? `Over budget by ${currency(Math.abs(remainingBudget))}`

                    : `${currency(remainingBudget)} remaining`}

                </p>



                {remainingBudget < 0 && (

                  <div

                    style={{

                      padding: 14,

                      borderRadius: 12,

                      background: "#fff0ee",

                      color: "#922b21",

                    }}

                  >

                    <strong>

                      <AlertCircle

                        size={17}

                        style={{ verticalAlign: "middle" }}

                      />{" "}

                      Your cart exceeds your budget.

                    </strong>

                    <p>

                      Essential: {currency(priorityTotals.Essential)} ·

                      Important: {currency(priorityTotals.Important)} ·

                      Optional: {currency(priorityTotals.Optional)}

                    </p>

                    <p>

                      Removing Optional items could save{" "}

                      {currency(optionalSavings)}.

                      {optionalSavings < Math.abs(remainingBudget) &&

                        importantSavings > 0 &&

                        " If needed, review Important items too."}

                    </p>

                    <button

                      style={{

                        ...outlineButton,

                        color: "#922b21",

                      }}

                      onClick={sortCartByPriority}

                    >

                      Sort cart by priority

                    </button>

                  </div>

                )}

              </section>

{smartSuggestions.length > 0 && (
  <section
    style={{
      ...cardStyle,
      marginBottom: 22,
      background: "#f5faf3",
    }}
  >
    <h2 style={{ marginTop: 0 }}>
      🛍️ Recommended for You
    </h2>

    <p style={muted}>
      Based on items you have ordered before.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
      }}
    >
      {smartSuggestions.map((product) => (
        <article
          key={product.id}
          style={{
            ...cardStyle,
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 32 }}>
            {product.emoji || "🛒"}
          </div>

          <h3 style={{ marginBottom: 6 }}>
            {product.name}
          </h3>

          <p style={muted}>
            Ordered in {product.previousOrders} previous{" "}
            {product.previousOrders === 1 ? "order" : "orders"}
          </p>

          <p style={{ fontWeight: 800, color: "#276442" }}>
            {currency(product.price)}
          </p>

          <button
            style={buttonStyle}
            onClick={() => addToCart(product)}
          >
            <Plus size={16} />
            Add to cart
          </button>
        </article>
      ))}
    </div>
  </section>
)}

              <section id="grocwise-products">

                <h2>Fresh from the store</h2>

                <p style={muted}>

                  Products are loaded from your backend database.

                </p>



                <div

                  style={{

                    display: "flex",

                    gap: 10,

                    flexWrap: "wrap",

                    margin: "16px 0",

                  }}

                >

                  <div

                    style={{

                      display: "flex",

                      alignItems: "center",

                      gap: 8,

                      background: "#fff",

                      border: "1px solid #e4eae1",

                      padding: "0 12px",

                      borderRadius: 10,

                      minWidth: 220,

                    }}

                  >

                    <Search size={17} />

                    <input

                      value={search}

                      onChange={(event) => setSearch(event.target.value)}

                      placeholder="Search groceries..."

                      style={{

                        padding: 12,

                        border: "none",

                        outline: "none",

                        width: "100%",

                      }}

                    />

                  </div>



                  {categories.map((item) => (

                    <button

                      key={item}

                      style={

                        category === item ? buttonStyle : outlineButton

                      }

                      onClick={() => setCategory(item)}

                    >

                      {item}

                    </button>

                  ))}

                </div>



                {loading && <p>Loading products…</p>}



                {apiError && (

                  <div

                    style={{

                      ...cardStyle,

                      color: "#a12b22",

                      marginBottom: 16,

                    }}

                  >

                    {apiError}

                    <button

                      style={{ ...outlineButton, marginLeft: 10 }}

                      onClick={loadProducts}

                    >

                      <RefreshCw size={15} /> Retry

                    </button>

                  </div>

                )}



                {!loading && !apiError && filteredProducts.length === 0 && (

                  <p>No products match your search.</p>

                )}



                <div

                  style={{

                    display: "grid",

                    gridTemplateColumns:

                      "repeat(auto-fit, minmax(205px, 1fr))",

                    gap: 16,

                  }}

                >

                  {filteredProducts.map((product) => (

                    <article

                      key={product.id}

                      style={{

                        ...cardStyle,

                        padding: 0,

                        overflow: "hidden",

                      }}

                    >

                      <div

                        style={{

                          background: product.color,

                          minHeight: 125,

                          display: "grid",

                          placeItems: "center",

                          position: "relative",

                        }}

                      >


{product.image ? (
  <img
    src={product.image}
    alt={product.name}
    style={{
      width: "100%",
      height: 145,
      objectFit: "contain",
      padding: 12,
      boxSizing: "border-box",
    }}
  />
) : (
  <span style={{ fontSize: 65 }}>
    {product.emoji}
  </span>
)}




                        <button

                          aria-label="Toggle favorite"

                          onClick={() => toggleFavorite(product.id)}

                          style={{

                            position: "absolute",

                            top: 10,

                            right: 10,

                            background: "#fff",

                            border: "none",

                            borderRadius: 30,

                            padding: 8,

                            cursor: "pointer",

                          }}

                        >

                          <Heart

                            size={18}

                            fill={

                              favorites.includes(product.id)

                                ? "#e14b60"

                                : "none"

                            }

                            color={

                              favorites.includes(product.id)

                                ? "#e14b60"

                                : "#526252"

                            }

                          />

                        </button>

                      </div>



                      <div style={{ padding: 15 }}>

                        <p

                          style={{

                            ...muted,

                            fontSize: 12,

                            margin: "0 0 6px",

                          }}

                        >

                          {product.category}

                        </p>

                        <h3 style={{ margin: "0 0 8px" }}>

                          {product.name}

                        </h3>

                        {product.tag && (

                          <p style={{ ...muted, fontSize: 12 }}>

                            {product.tag}

                          </p>

                        )}

                        <strong>{currency(product.price)}</strong>



                        <button

                          style={{

                            ...buttonStyle,

                            width: "100%",

                            marginTop: 12,

                            opacity: product.inStock ? 1 : 0.55,

                          }}

                          disabled={!product.inStock}

                          onClick={() => addToCart(product)}

                        >

                          <Plus size={16} />

                          {product.inStock ? "Add to cart" : "Out of stock"}

                        </button>

                      </div>

                    </article>

                  ))}

                </div>

              </section>

            </>

          ) : activePage === "Dashboard" ? (

            <section style={cardStyle}>

              <h1>Your dashboard</h1>

              <p>Total products: {products.length}</p>

              <p>Items in cart: {cartCount}</p>

              <p>Current cart value: {currency(cartTotal)}</p>

              <p>Shopping budget: {currency(budget)}</p>

              <p>Orders in this browser: {orders.length}</p>

            </section>

          ) : activePage === "My Orders" ? (

            <section style={cardStyle}>

              <h1>Your orders</h1>

              {orders.length === 0 ? (

                <p style={muted}>No demo orders placed yet.</p>

              ) : (

                orders.map((order) => (

                  <div

                    key={order.id}

                    style={{

                      padding: "14px 0",

                      borderBottom: "1px solid #e7ece4",

                    }}

                  >

                    <strong>{order.id}</strong>

                    <p style={muted}>{order.date}</p>

                    <p>Total: {currency(order.total)}</p>

                    {order.items.map((item, index) => (

                      <p key={`${item.name}-${index}`}>

                        {item.name} × {item.quantity} · {item.priority}

                      </p>

                    ))}

                  </div>

                ))

              )}

            </section>

          
) : activePage === "Shopping Lists" ? (
  <section style={cardStyle}>
    <h1>My Shopping List</h1>

    <p style={muted}>
      Plan your purchases, choose quantities, and set priorities.
    </p>

    <form
      onSubmit={(event) => {
        event.preventDefault();
        addShoppingListItem();
      }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 12,
        marginTop: 20,
        marginBottom: 24,
      }}
    >
      <input
        type="text"
        placeholder="What do you want to buy?"
        value={listItemName}
        onChange={(event) => setListItemName(event.target.value)}
        style={{
          padding: 12,
          border: "1px solid #dce6d9",
          borderRadius: 9,
          minWidth: 0,
        }}
      />

      <input
        type="number"
        min="1"
        step="1"
        placeholder="Quantity"
        value={listItemQuantity}
        onChange={(event) => setListItemQuantity(event.target.value)}
        style={{
          padding: 12,
          border: "1px solid #dce6d9",
          borderRadius: 9,
          minWidth: 0,
        }}
      />

      <select
        value={listItemPriority}
        onChange={(event) => setListItemPriority(event.target.value)}
        style={{
          padding: 12,
          border: "1px solid #dce6d9",
          borderRadius: 9,
          background: "#fff",
        }}
      >
        <option value="Essential">Essential</option>
        <option value="Important">Important</option>
        <option value="Optional">Optional</option>
      </select>

      <button type="submit" style={buttonStyle}>
        <Plus size={16} />
        Add item
      </button>
    </form>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      <strong>{shoppingList.length} planned items</strong>
      <span style={muted}>
        {shoppingList.filter((item) => item.checked).length} completed
      </span>
    </div>

    {shoppingList.length === 0 ? (
      <div
        style={{
          textAlign: "center",
          padding: 28,
          background: "#f7f9f5",
          borderRadius: 12,
        }}
      >
        <ListChecks size={32} color="#39764c" />
        <h3>Your shopping list is empty</h3>
        <p style={muted}>
          Enter an item, quantity, and priority above to get started.
        </p>
      </div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {shoppingList.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              padding: 14,
              border: "1px solid #e7ece4",
              borderRadius: 12,
              background: item.checked ? "#f7f9f5" : "#fff",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: "1 1 180px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleShoppingListItem(item.id)}
              />

              <span
                style={{
                  textDecoration: item.checked ? "line-through" : "none",
                  color: item.checked ? "#788579" : "#25372c",
                  fontWeight: 700,
                }}
              >
                {item.name}
              </span>
            </label>

            <span style={muted}>
              Qty: {item.quantity}
            </span>

            <span
              style={{
                padding: "5px 9px",
                borderRadius: 8,
                background:
                  priorityColors[item.priority] || "#e5f4e8",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {item.priority}
            </span>

            <button
              type="button"
              aria-label={`Delete ${item.name}`}
              title="Delete item"
              onClick={() => deleteShoppingListItem(item.id)}
              style={{
                ...outlineButton,
                padding: 8,
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
          ) : activePage === "Offers & Deals" ? (

            <section style={cardStyle}>

              <h1>Offers & Deals</h1>

              <p>

                Browse the product catalogue for current tags and offers.

              </p>

              <button

                style={buttonStyle}

                onClick={() => setActivePage("Shop")}

              >

                Browse products

              </button>

            </section>

          ) : activePage === "Analytics" ? (

            <section style={cardStyle}>

              <h1>Shopping analytics</h1>

              <p>Cart spending: {currency(cartTotal)}</p>

              <p>Budget usage: {budget > 0 ? `${((cartTotal / budget) * 100).toFixed(1)}%` : "Budget is zero"}</p>

              <p>Essential spending: {currency(priorityTotals.Essential)}</p>

              <p>Important spending: {currency(priorityTotals.Important)}</p>

              <p>Optional spending: {currency(priorityTotals.Optional)}</p>
              <MarketPrices />

            </section>

          ) : (

            <section style={cardStyle}>

              <h1>Notifications</h1>

              <p style={muted}>You're all caught up.</p>

            </section>

          )}



          <footer

            style={{

              padding: "30px 0 5px",

              textAlign: "center",

              fontSize: 12,

              color: "#8a9688",

            }}

          >

            <Leaf size={14} style={{ verticalAlign: "middle" }} /> GrocWise —

            Shop Smart. Spend Wise. Waste Less.

          </footer>

        </main>

      </div>



      {cartOpen && (

        <div

          onClick={() => setCartOpen(false)}

          style={{

            position: "fixed",

            inset: 0,

            background: "#14251b75",

            zIndex: 30,

            display: "flex",

            justifyContent: "flex-end",

          }}

        >

          <aside

            onClick={(event) => event.stopPropagation()}

            style={{

              width: "min(470px, 100%)",

              height: "100%",

              overflowY: "auto",

              background: "#fff",

              padding: 22,

              boxSizing: "border-box",

            }}

          >

            <div

              style={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

              }}

            >

              <h2>Your cart ({cartCount})</h2>

              <button

                style={outlineButton}

                onClick={() => setCartOpen(false)}

              >

                Close

              </button>

            </div>



            {cart.length === 0 ? (

              <p style={muted}>Your cart is empty.</p>

            ) : (

              <>

                <button

                  style={{ ...outlineButton, marginBottom: 14 }}

                  onClick={sortCartByPriority}

                >

{priceChanges.length > 0 && (
  <div
    role="alert"
    style={{
      padding: 14,
      marginBottom: 16,
      borderRadius: 12,
      border: "1px solid #f0cf87",
      background: "#fff8e8",
      color: "#654b16",
    }}
  >
    <strong>Price changes detected — please review</strong>

    <p style={{ fontSize: 13 }}>
      The cart below now uses the latest prices. Check the new total
      before selecting Place demo order again.
    </p>

    {priceChanges.map((change) => (
      <div
        key={change.id}
        style={{
          padding: "8px 0",
          borderTop: "1px solid #f0dfb8",
        }}
      >
        <strong>{change.name}</strong>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Previous: {currency(change.oldPrice)} ·
          {" "}Now: {currency(change.newPrice)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {change.newPrice > change.oldPrice
            ? `Increased by ${currency(change.newPrice - change.oldPrice)} per item`
            : `Decreased by ${currency(change.oldPrice - change.newPrice)} per item`}
          {" "}· Quantity: {change.quantity}
        </div>
      </div>
    ))}
  </div>
)}

                  Sort by priority

                </button>



                {cart.map((item) => (

                  <div

                    key={item.id}

                    style={{

                      padding: "15px 0",

                      borderBottom: "1px solid #e8ede5",

                    }}

                  >

                    <div

                      style={{

                        display: "flex",

                        justifyContent: "space-between",

                        gap: 12,

                      }}

                    >

                      <div>

                        <strong>{item.emoji} {item.name}</strong>

                        <p style={{ ...muted, margin: "5px 0" }}>

                          {currency(item.price)} each

                        </p>

                      </div>

                      <strong>

                        {currency(item.price * item.quantity)}

                      </strong>

                    </div>



                    <label

                      style={{

                        display: "block",

                        fontSize: 12,

                        margin: "10px 0 6px",

                      }}

                    >

                      Shopping priority

                    </label>

                    <select

                      value={item.priority}

                      onChange={(event) =>

                        updatePriority(item.id, event.target.value)

                      }

                      style={{

                        padding: 9,

                        border: "1px solid #dce6d9",

                        borderRadius: 8,

                        background: priorityColors[item.priority],

                      }}

                    >

                      {priorities.map((priority) => (

                        <option key={priority} value={priority}>

                          {priority}

                        </option>

                      ))}

                    </select>



                    <div

                      style={{

                        display: "flex",

                        alignItems: "center",

                        gap: 10,

                        marginTop: 10,

                      }}

                    >

                      <button

                        style={outlineButton}

                        onClick={() => changeQuantity(item.id, -1)}

                        aria-label={`Decrease ${item.name} quantity`}

                      >

                        <Minus size={14} />

                      </button>

                      <span>{item.quantity}</span>

                      <button

                        style={outlineButton}

                        onClick={() => changeQuantity(item.id, 1)}

                        aria-label={`Increase ${item.name} quantity`}

                      >

                        <Plus size={14} />

                      </button>

                      <button

                        style={{

                          ...outlineButton,

                          marginLeft: "auto",

                          color: "#b42318",

                        }}

                        onClick={() => removeFromCart(item.id)}

                      >

                        <Trash2 size={15} /> Remove

                      </button>

                    </div>

                  </div>

                ))}



                <div style={{ marginTop: 20 }}>

                  <h3>Priority breakdown</h3>

                  {priorities.map((priority) => (

                    <div

                      key={priority}

                      style={{

                        display: "flex",

                        justifyContent: "space-between",

                        padding: "7px 0",

                      }}

                    >

                      <span>{priority}</span>

                      <strong>{currency(priorityTotals[priority])}</strong>

                    </div>

                  ))}

                </div>



                <div

                  style={{

                    marginTop: 18,

                    padding: 15,

                    borderRadius: 12,

                    background: remainingBudget < 0 ? "#fff0ee" : "#edf5e9",

                  }}

                >

                  <p style={{ margin: "0 0 8px" }}>Cart total</p>

                  <h2 style={{ margin: 0 }}>{currency(cartTotal)}</h2>

                  <p

                    style={{

                      color: remainingBudget < 0 ? "#b42318" : "#276442",

                    }}

                  >

                    {remainingBudget < 0

                      ? `Over budget by ${currency(Math.abs(remainingBudget))}`

                      : `${currency(remainingBudget)} remaining in budget`}

                  </p>



                  {remainingBudget < 0 && (

                    <p style={{ fontSize: 13 }}>

                      Recommendation: review Optional items first. Removing

                      them could save {currency(optionalSavings)}.

                    </p>

                  )}



<button
  style={{ ...buttonStyle, width: "100%", marginTop: 10 }}
  onClick={placeOrder}
  disabled={checkingPrices}
>
  <CheckCircle2 size={17} />
  {checkingPrices
    ? "Checking latest prices..."
    : priceChanges.length > 0
      ? "Confirm updated prices & order"
      : "Check prices & place order"}
</button>

                  

                  <p style={{ ...muted, fontSize: 11 }}>

                    Demo checkout updates Smart Pantry and browser order

                    history. It does not submit an order to MongoDB.

                  </p>

                </div>

              </>

            )}

          </aside>

        </div>

      )}



      {toast && (

        <div

          role="status"

          style={{

            position: "fixed",

            bottom: 22,

            right: 22,

            zIndex: 50,

            background: "#245b3d",

            color: "#fff",

            borderRadius: 12,

            padding: "14px 18px",

            boxShadow: "0 8px 28px #0002",

            maxWidth: 350,

          }}

        >

          {toast}

        </div>

      )}



      <style>{`

        @media (max-width: 760px) {

          .grocwise-main-layout {

            grid-template-columns: 1fr !important;

          }

          .grocwise-main-layout > aside {

            border-right: none !important;

            border-bottom: 1px solid #e8ede5;

          }

        }

      `}</style>

    </div>

  );

}
