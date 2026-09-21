import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  FileText,
  Printer,
  Check,
  ChevronDown,
  Heart,
  Laptop,
  Leaf,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Recycle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tablet,
  User,
  X,
  Zap,
  Download,
  RotateCw,
} from "lucide-react";

import { products, partners } from "./data";
import { useStore } from "./store";
import type { Product } from "./types";
import {
  adminLogin,
  fetchAdminActivities,
  fetchApprovedListings,
  fetchPendingListings,
  reviewListing,
  deleteListing,
  submitActivity,
  submitListing,
} from "./backend";

type ModalType =
  | "buy"
  | "repair"
  | "donate"
  | "recycle"
  | "sell"
  | "swap"
  | "admin"
  | "search"
  | "track"
  | "notifications"
  | "profile"
  | null;

type ActivityRecord = {
  trackingId: string;
  type: string;
  title: string;
  description: string;
  timestamp: number;
  status?: string;
};

const deviceTabs = [
  "All",
  "Mobile",
  "Laptop",
  "Desktop Computer",
  "Tablet",
  "Monitor",
  "Printer",
  "Camera",
  "Gaming Console",
];

const deviceImages: Record<string, string> = {
  Mobile: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
  Laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
  "Desktop Computer": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85",
  Tablet: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
  Monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85",
  Printer: "https://images.unsplash.com/photo-1612815154858-60aa4c59e4ee?auto=format&fit=crop&w=1000&q=85",
  Camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85",
  "Gaming Console": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1000&q=85",
};

function getConditionImage(category: string, _condition: string) {
  return deviceImages[category] || deviceImages.Laptop;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(String(reader.result || ""));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.76));
      };
      image.onerror = () => reject(new Error("Unable to process the selected image."));
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function App() {
  const { saved, toggleSaved, notify } = useStore();

  const [activeTab, setActiveTab] = useState("All");
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [modal, setModal] = useState<ModalType>(null);

  const [searchText, setSearchText] = useState("");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [sellPhotoPreview, setSellPhotoPreview] = useState<string>("");
  const [sellPhotoNames, setSellPhotoNames] = useState<string[]>([]);

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminSigningIn, setAdminSigningIn] = useState(false);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("circularhub_admin_token") || "");
  const [approvedListings, setApprovedListings] = useState<Product[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [approvedAdminListings, setApprovedAdminListings] = useState<any[]>([]);
  const [backendActivities, setBackendActivities] = useState<ActivityRecord[]>([]);

  // Warm the Vercel admin function in the background so the first real
  // sign-in is not delayed by a serverless cold start. This never blocks UI.
  useEffect(() => {
    void fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "", password: "" }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  const [submission, setSubmission] = useState<{
    trackingId: string;
    title: string;
    message: string;
    fields: Array<[string, string]>;
    amount?: number;
  } | null>(null);

  const [notifications, setNotifications] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("circularhub_notifications");
      return stored ? JSON.parse(stored) : [
        "Welcome to CircularHub — your circular journey starts here.",
        "Your activity history is ready. Every submitted action gets a tracking ID.",
        "Tip: use Track to check your latest sell, swap, order, repair or recycle request."
      ];
    } catch {
      return ["Welcome to CircularHub — your circular journey starts here."];
    }
  });
  const [activities, setActivities] = useState<ActivityRecord[]>(() => {
    try {
      const stored = localStorage.getItem("circularhub_activities");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("circularhub_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("circularhub_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Keep notifications in sync if the user and admin are open in different tabs.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "circularhub_notifications" || !event.newValue) return;
      try {
        const next = JSON.parse(event.newValue);
        if (Array.isArray(next)) setNotifications(next);
      } catch {
        // Ignore malformed local storage values.
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const addNotification = (message: string) => {
    setNotifications((prev: string[]) => [message, ...prev].slice(0, 12));
    notify(message);
  };

  useEffect(() => {
    if (!adminLoggedIn || !adminToken) return;

    Promise.all([
      fetchPendingListings(adminToken, "pending"),
      fetchPendingListings(adminToken, "approved"),
      fetchAdminActivities(adminToken),
    ])
      .then(([listings, approved, backendHistory]) => {
        setPendingListings(listings);
        setApprovedAdminListings(approved);
        setBackendActivities(backendHistory.map((item) => ({
          trackingId: item.trackingId,
          type: item.type,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
          status: item.status,
        })));
      })
      .catch(() => {
        notify("Unable to load backend data. Check your database connection.");
      });
  }, [adminLoggedIn, adminToken]);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      ".section, .statsSection, .activityCard, .partnerCard, .statCard, .pathwayCard, .finalCTA"
    );
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, [adminLoggedIn]);

  const marketplaceProducts = useMemo(() => [...approvedListings, ...products], [approvedListings]);

  useEffect(() => {
    fetchApprovedListings()
      .then(setApprovedListings)
      .catch(() => {
        // The static demo catalogue remains available if the database is not configured yet.
      });
  }, []);

  const savedProducts = useMemo(() => {
    return marketplaceProducts.filter((product) => saved.includes(product.id));
  }, [marketplaceProducts, saved]);

  const filteredProducts = useMemo(() => {
    return marketplaceProducts.filter((product) => {
      const matchesCategory =
        activeTab === "All" ||
        product.category.toLowerCase() === activeTab.toLowerCase();

      const query = searchText.toLowerCase();

      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeTab, searchText, marketplaceProducts]);

  const scrollTo = (id: string) => {
    setMobileMenu(false);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const closeModal = () => {
    setModal(null);
  };

  // Dashboard is protected: every visit starts a fresh admin login.
  const openAdminLogin = () => {
    setAdminLoggedIn(false);
    setAdminSigningIn(false);
    setModal("admin");

    // Warm again when the admin panel is opened.
    void fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "", password: "" }),
      keepalive: true,
    }).catch(() => undefined);
  };

  const makeSubmission = async (
    prefix: string,
    title: string,
    message: string,
    fields: Array<[string, string]>,
    amount?: number,
  ) => {
    const stamp = Date.now();
    const trackingId = `TRK-${stamp.toString(36).toUpperCase().slice(-7)}`;
    const typeMap: Record<string, string> = {
      ORD: "Order",
      SL: "Sell",
      RP: "Repair",
      DN: "Donation",
      RC: "Recycle",
      SW: "Swap",
    };
    const type = typeMap[prefix] || "Activity";
    const firstValue = fields.find(([label]) =>
      /product|item|device|user item/i.test(label)
    )?.[1] || "Your request";

    setActivities((prev: ActivityRecord[]) => [
      {
        trackingId,
        type,
        title,
        description: `${firstValue} · ${type.toLowerCase()} request submitted`,
        timestamp: stamp,
        status: type === "Order" || type === "Repair" ? "Processing" : "Submitted",
      },
      ...prev,
    ].slice(0, 20));

    setSubmission({ trackingId, title, message, fields, amount });
    setNotifications((prev: string[]) => [
      `${type} submitted successfully · Tracking ID ${trackingId}`,
      ...prev,
    ].slice(0, 12));
    setModal(null);
    void submitActivity({
      trackingId,
      type,
      title,
      description: `${firstValue} · ${type.toLowerCase()} request submitted`,
      fields,
      amount: amount || 0,
      status: type === "Order" || type === "Repair" ? "Processing" : "Submitted",
    }).catch(() => {
      // Local activity history still works if the backend is temporarily unavailable.
    });
    notify(`${type} submitted successfully. Tracking ID: ${trackingId}`);
  };


  const handleBuy = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    makeSubmission(
      "ORD",
      "Order submitted",
      "Your order request has been submitted successfully. Keep your Tracking ID for tracking.",
      [
        ["User Name", String(form.get("name") || "")],
        ["Email", String(form.get("email") || "")],
        ["Country", String(form.get("country") || "")],
        ["Phone", String(form.get("phone") || "")],
        ["Address", String(form.get("address") || "")],
        ["City", String(form.get("city") || "")],
        ["State", String(form.get("state") || "")],
        ["Pincode", String(form.get("pincode") || "")],
        ["Product", selectedProduct?.name || "CircularHub item"],
      ],
      selectedProduct?.price || 0,
    );
    setSelectedProduct(null);
  };

  const handleRepair = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    makeSubmission(
      "RP",
      "Repair request submitted",
      "Your repair request has been submitted successfully. Keep your Tracking ID for tracking.",
      [
        ["User Name", String(form.get("name") || "")],
        ["Device", String(form.get("device") || "")],
        ["Device Model", String(form.get("model") || "")],
        ["Problem", String(form.get("problem") || "")],
        ["Preferred Date", String(form.get("date") || "")],
        ["Preferred Time", String(form.get("time") || "")],
        ["Pickup / Drop-off", String(form.get("method") || "")],
        ["Email", String(form.get("email") || "")],
        ["Country", String(form.get("country") || "")],
        ["Phone", String(form.get("phone") || "")],
        ["Additional Notes", String(form.get("notes") || "")],
      ],
    );
  };

  const handleDonate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    makeSubmission(
      "DN",
      "Donation request submitted",
      "Your donation request has been submitted successfully. Keep your Tracking ID for tracking.",
      [
        ["User Name", String(form.get("name") || "")],
        ["Item Name", String(form.get("item") || "")],
        ["Category", String(form.get("category") || "")],
        ["Organisation", String(form.get("organisation") || "")],
        ["Preferred Date", String(form.get("date") || "")],
        ["Country", String(form.get("country") || "")],
        ["Phone", String(form.get("phone") || "")],
        ["Email", String(form.get("email") || "")],
        ["Address", String(form.get("address") || "")],
      ],
    );
  };

  const handleRecycle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    makeSubmission(
      "RC",
      "Recycling pickup submitted",
      "Your recycling pickup request has been submitted successfully. Keep your Tracking ID for tracking.",
      [
        ["User Name", String(form.get("name") || "")],
        ["Item", String(form.get("item") || "")],
        ["Quantity", String(form.get("quantity") || "")],
        ["Pickup Date", String(form.get("date") || "")],
        ["Pickup Time", String(form.get("time") || "")],
        ["Country", String(form.get("country") || "")],
        ["Phone", String(form.get("phone") || "")],
        ["Email", String(form.get("email") || "")],
        ["Address", String(form.get("address") || "")],
        ["City", String(form.get("city") || "")],
      ],
    );
  };

  const handleSell = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "My Circular Product");
    const price = Number(form.get("price") || 0);
    const category = String(form.get("category") || "Mobile");
    const condition = String(form.get("condition") || "Good");
    const seller = String(form.get("sellerName") || "CircularHub User");
    const description = String(form.get("description") || "CircularHub marketplace listing.");
    const image = sellPhotoPreview || getConditionImage(category, condition);

    try {
      await submitListing({
        name,
        category,
        brand: String(form.get("brand") || "Other"),
        price,
        originalPrice: Number(form.get("originalPrice") || price),
        condition,
        age: String(form.get("age") || "1 year"),
        city: String(form.get("city") || "Mumbai"),
        seller,
        score: 86,
        image,
        images: image ? [image] : [],
        description,
      });

      await makeSubmission(
        "SL",
        "Listing submitted",
        "Your product listing has been submitted successfully and is waiting for admin approval before it appears in the marketplace.",
        [
          ["Seller / User Name", seller],
          ["Phone Number", String(form.get("phone") || "")],
          ["Product Name", name],
          ["Brand", String(form.get("brand") || "")],
          ["Device Type", category],
          ["Condition", condition],
          ["Product Age", String(form.get("age") || "")],
          ["Original Price", `₹${Number(form.get("originalPrice") || 0).toLocaleString("en-IN")}`],
          ["Expected Price", `₹${price.toLocaleString("en-IN")}`],
          ["City", String(form.get("city") || "")],
          ["Product Description", description],
        ],
        price,
      );

      event.currentTarget.reset();
      setSellPhotoPreview("");
      setSellPhotoNames([]);
      addNotification("Your listing was sent to the admin for approval. It will appear in Explore after approval.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Unable to submit the listing right now.");
    }
  };

  const formatActivityTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.max(1, Math.floor(diff / 60000));
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const activityIcon = (type: string) => {
    if (type === "Repair") return <Zap size={18} />;
    if (type === "Donation") return <Heart size={18} />;
    if (type === "Recycle") return <Recycle size={18} />;
    if (type === "Swap") return <RotateCw size={18} />;
    if (type === "Sell") return <Package size={18} />;
    return <ShoppingBag size={18} />;
  };

  return (
    <div className="app dark">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="navInner">

          <button
            className="brand"
            onClick={() => scrollTo("home")}
          >
            <span className="brandIcon">
              <Recycle size={22} />
            </span>

            <span>CircularHub</span>
          </button>

          <nav className="desktopNav">

            <button
              className="active"
              onClick={() => scrollTo("home")}
            >
              Home
            </button>

            <button onClick={() => scrollTo("explore")}>
              Explore
            </button>

            <button onClick={() => scrollTo("pathways")}>
              Pathways
            </button>

            <button onClick={() => scrollTo("donate")}>
              Donate
            </button>

            <button onClick={() => scrollTo("repair")}>
              Repair
            </button>

            <button onClick={() => scrollTo("recycle")}>
              Recycle
            </button>

            <button onClick={() => scrollTo("impact")}>
              Impact
            </button>

            <button onClick={() => scrollTo("favorites")}>
              Favourites
            </button>

            <button onClick={() => setModal("track")}>
              Track
            </button>

          </nav>

          <div className="navActions">

            <button
              className="iconButton"
              title="Search"
              onClick={() => setModal("search")}
            >
              <Search size={19} />
            </button>

            <button
              className="iconButton notificationButton"
              title="Notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={19} />
              <span className="notificationDot" />
            </button>

            <button
              className="avatar"
              onClick={openAdminLogin}
            >
              AR
            </button>

            <button
              className="profileName"
              onClick={openAdminLogin}
            >
              Aanya
            </button>

            <button
              className="listButton"
              onClick={() => setModal("sell")}
            >
              + List an Item
            </button>

            <button
              className="mobileMenuButton"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

          </div>

        </div>

        {mobileMenu && (
          <div className="mobileMenu">

            <button onClick={() => scrollTo("home")}>
              Home
            </button>

            <button onClick={() => scrollTo("explore")}>
              Explore
            </button>

            <button onClick={() => scrollTo("pathways")}>
              Pathways
            </button>

            <button onClick={() => scrollTo("donate")}>
              Donate
            </button>

            <button onClick={() => scrollTo("repair")}>
              Repair
            </button>

            <button onClick={() => scrollTo("recycle")}>
              Recycle
            </button>

            <button onClick={() => scrollTo("impact")}>
              Impact
            </button>

            <button onClick={() => scrollTo("favorites")}>
              Favourites
            </button>

            <button onClick={() => setModal("track")}>
              Track
            </button>

          </div>
        )}

      </header>


      {/* ================= HERO ================= */}

      <main>

        <section
          id="home"
          className="hero section"
        >

          <div className="heroContent">

            <div className="eyebrow">
              <span />
              CIRCULAR MARKETPLACE
            </div>

            <h1>
              Give products
              <br />

              <em>a second life.</em>
            </h1>

            <p className="heroText">
              Buy smarter. Sell responsibly. Swap what
              you have. Repair what you love. Donate what
              can help. Recycle what cannot.
            </p>

            <div className="heroButtons">

              <button
                className="primaryButton"
                onClick={() => scrollTo("explore")}
              >
                Explore Marketplace
                <ArrowRight size={18} />
              </button>

              <button
                className="secondaryButton"
                onClick={() => setModal("sell")}
              >
                List an Item
                <Package size={18} />
              </button>

            </div>

            <div className="trustRow">

              <span>
                <ShieldCheck size={15} />
                Verified community
              </span>

              <span>
                <Zap size={15} />
                Fast local discovery
              </span>

              <span>
                <Leaf size={15} />
                Impact tracked
              </span>

            </div>

          </div>


          {/* CIRCULARHUB ORBIT */}

          <div className="orbitArea">

            <div className="orbitGlow" />

            <div
              className="orbit"
              style={{
                animation: "none",
                position: "absolute",
                inset: "3%",
                width: "94%",
                height: "94%",
                left: "3%",
                top: "3%",
                margin: 0,
                transform: "none",
                transformOrigin: "center center",
              }}
            >

              <div className="orbitRotating">
                <div className="orbitRing ringOne" />
              <div className="orbitRing ringTwo" />
              <div className="orbitRing ringThree" />

              <button
                className="orbitNode nodeBuy"
                onClick={() => scrollTo("explore")}
              >
                <ShoppingBag size={20} />
                <span>BUY</span>
              </button>

              <button
                className="orbitNode nodeSell"
                onClick={() => setModal("sell")}
              >
                <Package size={20} />
                <span>SELL</span>
              </button>

              <button
                className="orbitNode nodeSwap"
                onClick={() => setModal("swap")}
              >
                <Recycle size={20} />
                <span>SWAP</span>
              </button>

              <button
                className="orbitNode nodeDonate"
                onClick={() => scrollTo("donate")}
              >
                <Heart size={20} />
                <span>DONATE</span>
              </button>

              <button
                className="orbitNode nodeRepair"
                onClick={() => scrollTo("repair")}
              >
                <Zap size={20} />
                <span>REPAIR</span>
              </button>

              <button
                className="orbitNode nodeRecycle"
                onClick={() => scrollTo("recycle")}
              >
                <Recycle size={20} />
                <span>RECYCLE</span>
              </button>


              </div>



            </div>




          </div>

        </section>


        {/* ================= STATS ================= */}

        <section className="statsSection">

          <div className="statCard">
            <strong>12.8K kg</strong>
            <span>E-waste diverted</span>
          </div>

          <div className="statCard">
            <strong>4.6K</strong>
            <span>Products circulated</span>
          </div>

          <div className="statCard">
            <strong>2.1K</strong>
            <span>Community members</span>
          </div>

          <div className="statCard">
            <strong>87</strong>
            <span>Average impact score</span>
          </div>

        </section>


        {/* ================= MARKETPLACE ================= */}

        <section
          id="explore"
          className="section marketplaceSection"
        >

          <div className="sectionHeader">

            <div>

              <div className="eyebrow">
                <span />
                EXPLORE
              </div>

              <h2>
                Find something
                <br />
                worth circulating.
              </h2>

              <p>
                Discover quality pre-loved products from
                verified members around you.
              </p>

            </div>

            <button
              className="outlineButton"
              onClick={() => setModal("search")}
            >
              Search marketplace
              <Search size={17} />
            </button>

          </div>


          {/* DEVICE TABS */}

          <div className="deviceTabs">

            {deviceTabs.map((tab) => (
              <button
                key={tab}
                className={
                  activeTab === tab
                    ? "deviceTab selected"
                    : "deviceTab"
                }
                onClick={() => setActiveTab(tab)}
              >
                {tab === "Laptop" && (
                  <Laptop size={15} />
                )}

                {tab === "Tablet" && (
                  <Tablet size={15} />
                )}

                {tab === "Mobile" && (
                  <Phone size={15} />
                )}

                {tab === "All" && (
                  <Sparkles size={15} />
                )}

                {tab}
              </button>
            ))}

          </div>


          <div className="productGrid">

            {filteredProducts.map((product: Product) => (

              <article
                className="productCard"
                key={product.id}
              >

                <div className="productImage">

                  <img
                    src={product.image || getConditionImage(product.category, product.condition)}
                    alt={product.name}
                    onError={(event) => {
                      const image = event.currentTarget;
                      const fallback = getConditionImage(product.category, product.condition);
                      if (image.src !== fallback) image.src = fallback;
                    }}
                  />

                  <div className="conditionBadge">
                    {product.condition}
                  </div>

                  <button
                    className={
                      saved.includes(product.id)
                        ? "saveButton saved"
                        : "saveButton"
                    }
                    onClick={() =>
                      toggleSaved(product.id)
                    }
                  >
                    <Heart
                      size={18}
                      fill={
                        saved.includes(product.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>

                </div>


                <div className="productBody">

                  <div className="productCategory">
                    {product.category}
                  </div>

                  <h3>
                    {product.name}
                  </h3>

                  <p className="productDescription">
                    {product.description}
                  </p>

                  <div className="productMeta">

                    <span>
                      {product.city}
                    </span>

                    <span>
                      {product.age}
                    </span>

                  </div>


                  <div className="productBottom">

                    <div>
                      <strong>
                        ₹{product.price.toLocaleString("en-IN")}
                      </strong>

                      <del>
                        ₹
                        {product.originalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </del>
                    </div>

                    <div className="score">
                      {product.score}
                    </div>

                  </div>


                  <button
                    className="viewProduct"
                    onClick={() =>
                      setSelectedProduct(product)
                    }
                  >
                    View product
                    <ArrowRight size={16} />
                  </button>

                </div>

              </article>

            ))}

          </div>

        </section>


        {/* ================= FAVOURITES ================= */}

        <section
          id="favorites"
          className="section marketplaceSection"
        >

          <div className="sectionHeader">

            <div>

              <div className="eyebrow">
                <span />
                YOUR FAVOURITES
              </div>

              <h2>
                Products you
                <br />
                want to keep close.
              </h2>

              <p>
                Every product you like is saved here so you can
                easily find it again whenever you are ready.
              </p>

            </div>

            <button
              className="outlineButton"
              onClick={() => scrollTo("explore")}
            >
              Explore products
              <Search size={17} />
            </button>

          </div>

          {savedProducts.length ? (
            <div className="productGrid">

              {savedProducts.map((product: Product) => (

                <article
                  className="productCard"
                  key={`favorite-${product.id}`}
                >

                  <div className="productImage">

                    <img
                      src={product.image || getConditionImage(product.category, product.condition)}
                      alt={product.name}
                      onError={(event) => {
                        const image = event.currentTarget;
                        const fallback = getConditionImage(product.category, product.condition);
                        if (image.src !== fallback) image.src = fallback;
                      }}
                    />

                    <div className="conditionBadge">
                      {product.condition}
                    </div>

                    <button
                      className="saveButton saved"
                      aria-label={`Remove ${product.name} from favourites`}
                      title="Remove from favourites"
                      onClick={() => toggleSaved(product.id)}
                    >
                      <Heart
                        size={18}
                        fill="currentColor"
                      />
                    </button>

                  </div>

                  <div className="productBody">

                    <div className="productCategory">
                      {product.category}
                    </div>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="productDescription">
                      {product.description}
                    </p>

                    <div className="productMeta">
                      <span>{product.city}</span>
                      <span>{product.age}</span>
                    </div>

                    <div className="productBottom">
                      <div>
                        <strong>
                          ₹{product.price.toLocaleString("en-IN")}
                        </strong>
                        <del>
                          ₹{product.originalPrice.toLocaleString("en-IN")}
                        </del>
                      </div>

                      <div className="score">
                        {product.score}
                      </div>
                    </div>

                    <button
                      className="viewProduct"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View product
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </article>

              ))}

            </div>
          ) : (
            <div className="trackEmpty">
              <Heart size={25} />
              <strong>No favourites yet</strong>
              <span>Tap the heart on any product you like and it will appear here.</span>
              <button
                type="button"
                className="primaryButton"
                onClick={() => scrollTo("explore")}
                style={{ marginTop: 8 }}
              >
                Browse marketplace
                <ArrowRight size={16} />
              </button>
            </div>
          )}

        </section>


        {/* ================= PATHWAYS ================= */}

        <section
          id="pathways"
          className="section pathwaysSection"
        >

          <div className="sectionHeader center">

            <div className="eyebrow">
              <span />
              ONE PRODUCT. SIX POSSIBILITIES.
            </div>

            <h2>
              Choose the next chapter.
            </h2>

            <p>
              CircularHub helps you choose the most useful
              next step for anything you own.
            </p>

          </div>


          <div className="pathwayGrid">

            <button
              className="pathwayCard"
              onClick={() => scrollTo("explore")}
            >
              <ShoppingBag />
              <span>BUY</span>
              <p>
                Give a quality product another home.
              </p>
              <ArrowRight />
            </button>

            <button
              className="pathwayCard"
              onClick={() => setModal("sell")}
            >
              <Package />
              <span>SELL</span>
              <p>
                Turn unused products into value.
              </p>
              <ArrowRight />
            </button>

            <button
              className="pathwayCard"
              onClick={() => setModal("swap")}
            >
              <Recycle />
              <span>SWAP</span>
              <p>
                Exchange something you have.
              </p>
              <ArrowRight />
            </button>

            <button
              className="pathwayCard"
              onClick={() => scrollTo("donate")}
            >
              <Heart />
              <span>DONATE</span>
              <p>
                Send useful products where they matter.
              </p>
              <ArrowRight />
            </button>

            <button
              className="pathwayCard"
              onClick={() => scrollTo("repair")}
            >
              <Zap />
              <span>REPAIR</span>
              <p>
                Extend the life of what you love.
              </p>
              <ArrowRight />
            </button>

            <button
              className="pathwayCard"
              onClick={() => scrollTo("recycle")}
            >
              <Recycle />
              <span>RECYCLE</span>
              <p>
                Recover materials responsibly.
              </p>
              <ArrowRight />
            </button>

          </div>

        </section>


        {/* ================= CIRCULAR ADVISOR ================= */}

        <section className="advisorSection section">

          <div className="advisorCard">

            <div className="advisorIcon">
              <Sparkles size={25} />
            </div>

            <div className="advisorContent">

              <div className="eyebrow">
                CIRCULAR ADVISOR
              </div>

              <h2>
                Not sure what to do
                with your old device?
              </h2>

              <p>
                Tell CircularHub about your product and
                discover whether repairing, selling,
                donating, swapping or recycling makes
                the most sense.
              </p>

              <button
                className="primaryButton"
                onClick={() => setModal("repair")}
              >
                Try Circular Advisor
                <ArrowRight size={18} />
              </button>

            </div>


            <div className="advisorResult">

              <span>EXAMPLE</span>

              <strong>
                Dell Laptop
              </strong>

              <p>
                4 years · Good condition · Battery 76%
              </p>

              <div className="advisorRecommendation">

                <Check size={17} />

                <div>
                  <strong>
                    Repair recommended
                  </strong>

                  <small>
                    ₹2,500 estimated · 12–18 months
                    extended life
                  </small>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ================= DONATE ================= */}

        <section
          id="donate"
          className="section partnerSection"
        >

          <div className="sectionHeader">

            <div>

              <div className="eyebrow">
                <span />
                DONATE WITH PURPOSE
              </div>

              <h2>
                Give useful things
                <br />
                somewhere useful.
              </h2>

              <p>
                Connect with verified organisations working
                across communities.
              </p>

            </div>

          </div>


          <div className="partnerGrid">

            {partners
              .filter((partner) => partner.type === "ngo")
              .map((partner) => (

                <article
                  className="partnerCard"
                  key={partner.id}
                >

                  <div className="partnerImage">

                    <img
                      src={partner.image}
                      alt={partner.name}
                    />

                    <span className="verifiedTag">
                      <ShieldCheck size={14} />
                      VERIFIED
                    </span>

                  </div>

                  <div className="partnerBody">

                    <div className="partnerTitle">

                      <div>

                        <h3>
                          {partner.name}
                        </h3>

                        <span className="partnerAddress">
                          {partner.location}
                        </span>
                        <span className="partnerContact">
                          <Phone size={12} /> {"phone" in partner ? String(partner.phone) : "Contact via CircularHub"}
                        </span>
                        <span className="partnerContact">
                          <MessageCircle size={12} /> {"email" in partner ? String(partner.email) : "Email available on request"}
                        </span>

                      </div>

                      <strong>
                        ★ {partner.rating}
                      </strong>

                    </div>

                    <p>
                      {partner.description}
                    </p>

                    <div className="tagRow">

                      {partner.tags.map((tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      ))}

                    </div>

                    <button
                      className="outlineButton full"
                      onClick={() => setModal("donate")}
                    >
                      Donate an item
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </article>

              ))}

          </div>

        </section>


        {/* ================= REPAIR ================= */}

        <section
          id="repair"
          className="section repairSection"
        >

          <div className="sectionHeader">

            <div>

              <div className="eyebrow">
                <span />
                REPAIR FIRST
              </div>

              <h2>
                Extend the life
                <br />
                before replacing it.
              </h2>

              <p>
                Trusted local repair partners with
                transparent services and ratings.
              </p>

            </div>

          </div>


          <div className="repairList">

            {partners
              .filter(
                (partner) => partner.type === "repair"
              )
              .map((partner) => (

                <article
                  className="repairRow"
                  key={partner.id}
                >

                  <div className="repairLogo">
                    <Zap size={23} />
                  </div>

                  <div className="repairInfo">

                    <h3>
                      {partner.name}
                    </h3>

                    <span>
                      {partner.location} ·{" "}
                      {"jobs" in partner ? String(partner.jobs) : "0"} repairs
                    </span>

                    <div className="tagRow">

                      {partner.tags.map((tag) => (
                        <span key={tag}>
                          {tag}
                        </span>
                      ))}

                    </div>

                  </div>

                  <div className="repairRating">
                    ★ {partner.rating}
                  </div>

                  <button
                    className="outlineButton"
                    onClick={() => setModal("repair")}
                  >
                    Book repair
                    <ArrowRight size={16} />
                  </button>

                </article>

              ))}

          </div>

        </section>


        {/* ================= RECYCLE ================= */}

        <section
          id="recycle"
          className="section recycleSection"
        >

          <div className="recycleHero">

            <div>

              <div className="eyebrow">
                <span />
                RESPONSIBLE RECYCLING
              </div>

              <h2>
                Nothing useful
                <br />
                should go to waste.
              </h2>

              <p>
                Schedule a responsible collection for
                electronics and other materials.
              </p>

              <button
                className="primaryButton"
                onClick={() => setModal("recycle")}
              >
                Schedule a pickup
                <ArrowRight size={18} />
              </button>

            </div>

            <div className="recycleVisual">
              <Recycle size={100} />
              <strong>
                1.8 kg
              </strong>
              <span>
                estimated e-waste avoided
              </span>
            </div>

          </div>


          <div className="recyclerGrid">

            {partners
              .filter(
                (partner) => partner.type === "recycler"
              )
              .map((partner) => (

                <article
                  className="recyclerCard"
                  key={partner.id}
                >

                  <img
                    src={partner.image}
                    alt={partner.name}
                  />

                  <div>

                    <span className="verifiedTag">
                      <ShieldCheck size={13} />
                      CERTIFIED
                    </span>

                    <h3>
                      {partner.name}
                    </h3>

                    <p>
                      {partner.description}
                    </p>

                    <button
                      className="outlineButton"
                      onClick={() => setModal("recycle")}
                    >
                      Schedule
                      <ArrowRight size={15} />
                    </button>

                  </div>

                </article>

              ))}

          </div>

        </section>


        {/* ================= IMPACT ================= */}

        <section
          id="impact"
          className="section impactSection"
        >

          <div className="impactHeader">

            <div>

              <div className="eyebrow">
                <span />
                YOUR CIRCULAR IMPACT
              </div>

              <h2>
                Every choice leaves
                <br />
                a smaller footprint.
              </h2>

              <p>
                Track avoided waste, estimated savings and
                actions across your CircularHub journey.
              </p>

            </div>

            <div className="impactScore">

              <span>
                CIRCULAR SCORE
              </span>

              <strong>
                87
              </strong>

              <small>
                / 100
              </small>

              <div className="progress">
                <span />
              </div>

              <em>
                Excellent
              </em>

            </div>

          </div>


          <div className="impactStats">

            <div>
              <strong>
                12
              </strong>
              <span>
                Products circulated
              </span>
            </div>

            <div>
              <strong>
                ₹48.2K
              </strong>
              <span>
                Money saved
              </span>
            </div>

            <div>
              <strong>
                8.4 kg
              </strong>
              <span>
                E-waste avoided
              </span>
            </div>

            <div>
              <strong>
                6
              </strong>
              <span>
                Circular actions
              </span>
            </div>

          </div>

        </section>


        {/* ================= DASHBOARD ================= */}

        {adminLoggedIn && (
          <section
            id="dashboard"
            className="section dashboardSection"
          >


          <div className="sectionHeader">

            <div>

              <div className="eyebrow">
                <span />
                ADMIN DASHBOARD
              </div>

              <h2>
                CircularHub operations,
                <br />
                in one place.
              </h2>

            </div>

            <button
              className="outlineButton"
              onClick={() => setModal("profile")}
            >
              <User size={16} />
              View profile
            </button>

          </div>


          <div className="dashboardGrid">

            <div className="dashboardCard large">

              <div className="dashboardTop">

                <span>
                  CIRCULAR IMPACT SCORE
                </span>

                <Sparkles size={20} />

              </div>

              <div className="dashboardScore">
                87
                <small>/100</small>
              </div>

              <p>
                Excellent
              </p>

              <div className="progress">
                <span />
              </div>

              <small>
                Top 8% of CircularHub members this month.
              </small>

            </div>


            <div className="dashboardCard">

              <span>
                LISTINGS
              </span>

              <strong>
                04
              </strong>

              <p>
                Active products
              </p>

            </div>


            <div className="dashboardCard">

              <span>
                REPAIRS
              </span>

              <strong>
                02
              </strong>

              <p>
                Devices extended
              </p>

            </div>


            <div className="dashboardCard">

              <span>
                SAVED
              </span>

              <strong>
                {saved.length}
              </strong>

              <p>
                Products saved
              </p>

            </div>


            <div className="dashboardCard">

              <span>
                ACTIONS
              </span>

              <strong>
                06
              </strong>

              <p>
                Circular actions
              </p>

            </div>

          </div>


        </section>
        )}

        {adminLoggedIn && (
          <section id="activity-history" className="section activityHistorySection">
          <div className="activityCard">

            <div className="activityHeader">
              <h3>Recent activity</h3>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById("activityDetails");
                  target?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                View all <ArrowRight size={15} />
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="activityEmpty">
                <div className="activityIcon"><RotateCw size={18} /></div>
                <div>
                  <strong>No activity yet</strong>
                  <span>Your sell, swap, buy, repair, donate and recycle actions will appear here.</span>
                </div>
              </div>
            ) : (
              activities.slice(0, 6).map((activity: ActivityRecord) => (
                <div className="activityItem" key={activity.trackingId}>
                  <div className="activityIcon">{activityIcon(activity.type)}</div>
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                  </div>
                  <time>{formatActivityTime(activity.timestamp)}</time>
                </div>
              ))
            )}
          </div>

          <div id="activityDetails" className="activityDetails">
            <div className="activityDetailsHead">
              <div>
                <div className="eyebrow"><span /> ACTIVITY HISTORY</div>
                <h3>Everything you've done on CircularHub.</h3>
              </div>
              <span>{activities.length} activities</span>
            </div>
            {activities.length ? activities.map((activity: ActivityRecord) => (
              <div className="activityHistoryRow" key={`history-${activity.trackingId}`}>
                <div className="activityIcon">{activityIcon(activity.type)}</div>
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.description}</span>
                  <small>Tracking ID: {activity.trackingId}</small>
                </div>
                <time>{new Date(activity.timestamp).toLocaleString("en-IN")}</time>
              </div>
            )) : (
              <p className="activityEmptyText">Submit a buy, sell, swap, repair, donate or recycle request and it will appear here automatically.</p>
            )}
          </div>

        </section>
        )}

        {/* ================= FINAL CTA ================= */}

        <section className="finalCTA section">

          <div>

            <div className="eyebrow">
              <span />
              READY TO CIRCULATE?
            </div>

            <h2>
              One product.
              <br />
              Six better possibilities.
            </h2>

            <p>
              Start with something you own, or discover
              something that deserves a second life.
            </p>

          </div>

          <div className="finalButtons">

            <button
              className="primaryButton"
              onClick={() => setModal("sell")}
            >
              List an item
              <ArrowRight size={18} />
            </button>

            <button
              className="secondaryButton"
              onClick={() => scrollTo("explore")}
            >
              Explore
              <Search size={18} />
            </button>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="footerBrand">

          <span className="brandIcon">
            <Recycle size={20} />
          </span>

          <strong>
            CircularHub
          </strong>

          <p>
            Give Products a Second Life.
          </p>

        </div>

        <div className="footerLinks">

          <button onClick={() => scrollTo("home")}>
            Home
          </button>

          <button onClick={() => scrollTo("explore")}>
            Explore
          </button>

          <button onClick={() => scrollTo("pathways")}>
            Pathways
          </button>

          <button onClick={() => scrollTo("impact")}>
            Impact
          </button>

          <button onClick={openAdminLogin}>
            Admin
          </button>

        </div>

        <p className="copyright">
          © 2026 CircularHub. Built for a more circular future.
        </p>

      </footer>


      {/* ================= PRODUCT MODAL ================= */}

      {selectedProduct && (

        <div
          className="modalOverlay"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="productModal modalBox"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="closeModal"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              <X size={20} />
            </button>


            <div className="modalProductImage">

              <img
                src={selectedProduct.image || getConditionImage(selectedProduct.category, selectedProduct.condition)}
                alt={selectedProduct.name}
                onError={(event) => {
                  const image = event.currentTarget;
                  const fallback = getConditionImage(selectedProduct.category, selectedProduct.condition);
                  if (image.src !== fallback) image.src = fallback;
                }}
              />

              <span className="conditionBadge">
                {selectedProduct.condition}
              </span>

            </div>


            <div className="modalProductContent">

              <div className="eyebrow">
                {selectedProduct.category}
              </div>

              <h2>
                {selectedProduct.name}
              </h2>

              <p className="modalDescription">
                {selectedProduct.description}
              </p>


              <div className="priceLine">

                <strong>
                  ₹
                  {selectedProduct.price.toLocaleString(
                    "en-IN"
                  )}
                </strong>

                <del>
                  ₹
                  {selectedProduct.originalPrice.toLocaleString(
                    "en-IN"
                  )}
                </del>

              </div>


              <div className="detailGrid">

                <div>
                  <span>
                    Condition
                  </span>

                  <strong>
                    {selectedProduct.condition}
                  </strong>
                </div>

                <div>
                  <span>
                    Age
                  </span>

                  <strong>
                    {selectedProduct.age}
                  </strong>
                </div>

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {selectedProduct.city}
                  </strong>
                </div>

                <div>
                  <span>
                    Circular Score
                  </span>

                  <strong>
                    {selectedProduct.score}/100
                  </strong>
                </div>

              </div>


              <div className="sellerBox">

                <div className="sellerAvatar">
                  {(selectedProduct.name.toLowerCase().includes("dell")
                    ? "Priya Goswami"
                    : selectedProduct.seller
                  ).slice(0, 2).toUpperCase()}
                </div>

                <div>

                  <span>
                    Listed by
                  </span>

                  <strong>
                    {selectedProduct.name.toLowerCase().includes("dell")
                      ? "Priya Goswami"
                      : selectedProduct.seller}
                  </strong>

                </div>

                <ShieldCheck size={18} />

              </div>


              <div className="modalButtons">

                <button
                  className="primaryButton"
                  onClick={() => setModal("buy")}
                >
                  Buy now
                  <ArrowRight size={17} />
                </button>


              </div>

            </div>

          </div>

        </div>

      )}


      {/* ================= GENERAL MODAL ================= */}

      {modal && (

        <div
          className="modalOverlay"
          onClick={closeModal}
        >

          <div
            className="modalBox formModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="closeModal"
              onClick={closeModal}
            >
              <X size={20} />
            </button>


            {/* SEARCH */}

            {modal === "search" && (

              <div>

                <div className="eyebrow">
                  SEARCH CIRCULARHUB
                </div>

                <h2>
                  Find what you're looking for.
                </h2>

                <div className="searchLarge">

                  <Search size={20} />

                  <input
                    autoFocus
                    placeholder="Search products, brands or categories..."
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(event.target.value)
                    }
                  />

                  <button
                    onClick={() => {
                      closeModal();
                      scrollTo("explore");
                    }}
                  >
                    Search
                  </button>

                </div>

                <div className="searchSuggestions">

                  <span>Try</span>

                  <button
                    onClick={() =>
                      setSearchText("Laptop")
                    }
                  >
                    Laptop
                  </button>

                  <button
                    onClick={() =>
                      setSearchText("iPhone")
                    }
                  >
                    iPhone
                  </button>

                  <button
                    onClick={() =>
                      setSearchText("Camera")
                    }
                  >
                    Camera
                  </button>

                </div>

              </div>

            )}


            {/* BUY */}

            {modal === "buy" && (

              <form
                onSubmit={handleBuy}
              >

                <div className="modalEyebrow">
                  COMPLETE YOUR ORDER
                </div>

                <h2>
                  {selectedProduct
                    ? `Buy ${selectedProduct.name}`
                    : "Complete your order"}
                </h2>

                <div className="formGrid">

                  <FormField
                    label="Full Name"
                    name="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Gmail / Email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    required
                  />

                  <CountryField />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />

                  <FormField
                    label="Address"
                    name="address"
                    placeholder="House / Street / Area"
                    autoComplete="street-address"
                    required
                  />

                  <FormField
                    label="City"
                    name="city"
                    placeholder="Mumbai"
                    required
                  />

                  <FormField
                    label="State"
                    name="state"
                    placeholder="Maharashtra"
                    required
                  />

                  <FormField
                    label="Pincode"
                    name="pincode"
                    placeholder="401101"
                    autoComplete="postal-code"
                    required
                  />

                </div>


                <div className="orderSummary">

                  <span>
                    Product
                  </span>

                  <strong>
                    {selectedProduct?.name || "CircularHub item"}
                  </strong>

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {selectedProduct?.price.toLocaleString(
                      "en-IN"
                    ) || "0"}
                  </strong>

                </div>


                <button
                  className="primaryButton full"
                  type="submit"
                >
                  Confirm order
                  <Check size={18} />
                </button>

              </form>

            )}


            {/* SELL */}

            {modal === "sell" && (

              <form onSubmit={handleSell}>

                <div className="modalEyebrow">
                  SELL RESPONSIBLY
                </div>

                <h2>
                  List an item
                </h2>

                <p className="formIntro">
                  Add your product details and let
                  CircularHub help it find a new owner.
                </p>

                <div className="formGrid">

                  <FormField
                    label="Product Name"
                    name="name"
                    placeholder="e.g. Dell Inspiron 14"
                    required
                  />

                  <FormField
                    label="Seller / User Name"
                    name="sellerName"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="9876543210"
                    autoComplete="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    prefix="+91"
                    inputMode="numeric"
                    digitsOnly
                  />

                  <FormField
                    label="Brand"
                    name="brand"
                    placeholder="e.g. Dell"
                    required
                  />

                  <SelectField
                    label="Device Type"
                    name="category"
                    options={[
                      "Mobile",
                      "Laptop",
                      "Desktop Computer",
                      "Tablet",
                      "Monitor",
                      "Printer",
                      "Camera",
                      "Gaming Console",
                    ]}
                  />

                  <SelectField
                    label="Condition"
                    name="condition"
                    options={[
                      "Excellent",
                      "Very Good",
                      "Good",
                      "Fair",
                    ]}
                  />

                  <FormField
                    label="Product Age"
                    name="age"
                    placeholder="e.g. 2 years"
                    required
                  />

                  <FormField
                    label="Original Price"
                    name="originalPrice"
                    type="number"
                    placeholder="55000"
                    min="0"
                    required
                  />

                  <FormField
                    label="Expected Price"
                    name="price"
                    type="number"
                    placeholder="18000"
                    required
                  />

                  <FormField
                    label="City"
                    name="city"
                    placeholder="Mumbai"
                    required
                  />

                </div>


                <label className="field fullField">

                  <span>
                    Product Description
                  </span>

                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Tell buyers about the product..."
                  />

                </label>


                <div className="uploadBox">

                  <Package size={25} />

                  <strong>
                    Add product photos
                  </strong>

                  <span>
                    PNG, JPG, JPEG or WEBP · You can choose multiple photos.
                  </span>

                  <label className="photoPickerButton">
                    Choose photos
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const files = Array.from(event.currentTarget.files ?? []) as File[];
                        if (!files.length) return;
                        setSellPhotoNames(files.map(file => file.name));
                        const first = files[0];
                        compressImage(first)
                          .then(setSellPhotoPreview)
                          .catch((error) => notify(error instanceof Error ? error.message : "Unable to process the selected image."));
                      }}
                    />
                  </label>

                  {sellPhotoNames.length > 0 && (
                    <div className="photoUploadResult">
                      {sellPhotoPreview && <img src={sellPhotoPreview} alt="Selected product" />}
                      <div>
                        <strong>{sellPhotoNames.length} photo{sellPhotoNames.length === 1 ? "" : "s"} selected</strong>
                        <span>{sellPhotoNames.slice(0, 3).join(" · ")}{sellPhotoNames.length > 3 ? " · +more" : ""}</span>
                      </div>
                    </div>
                  )}

                </div>

                <button
                  type="submit"
                  className="primaryButton full"
                >
                  Publish listing
                  <ArrowRight size={18} />
                </button>

              </form>

            )}


            {/* REPAIR */}

            {modal === "repair" && (

              <form onSubmit={handleRepair}>

                <h2>
                  Book a Repair
                </h2>

                <div className="formGrid">

                  <SelectField
                    label="Device Type"
                    name="device"
                    required
                    options={[
                      "Laptop",
                      "Mobile",
                      "Tablet",
                      "Camera",
                      "Gaming Console",
                    ]}
                  />

                  <FormField
                    label="Device Model"
                    name="model"
                    placeholder="e.g. Dell Inspiron 14"
                    required
                  />

                  <FormField
                    label="Problem"
                    name="problem"
                    placeholder="Describe the issue"
                    required
                  />

                  <DateField
                    label="Preferred Date"
                    name="date"
                  />

                  <FormField
                    label="Preferred Time"
                    name="time"
                    type="time"
                    required
                    min="09:00"
                    max="20:00"
                    step="900"
                  />

                  <SelectField
                    label="Pickup / Drop-off"
                    name="method"
                    required
                    options={[
                      "Pickup",
                      "Drop-off",
                    ]}
                  />

                  <FormField
                    label="Full Name"
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Gmail / Email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    required
                  />

                  <CountryField />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />

                </div>


                <label className="field fullField">

                  <span>
                    Additional Notes
                  </span>

                  <textarea
                    name="notes"
                    rows={4}
                    placeholder="Anything else the repair partner should know?"
                  />

                </label>


                <div className="bookingDetails">

                  <strong>
                    Booking details
                  </strong>

                  <span>
                    Choose your device, issue, preferred
                    date and pickup/drop-off option.
                  </span>

                </div>


                <button
                  className="primaryButton"
                  type="submit"
                >
                  Confirm Booking
                  <Check size={18} />
                </button>

              </form>

            )}


            {/* DONATE */}

            {modal === "donate" && (

              <form
                onSubmit={handleDonate}
              >

                <div className="modalEyebrow">
                  GIVE WITH PURPOSE
                </div>

                <h2>
                  Donate an Item
                </h2>

                <div className="formGrid">

                  <FormField
                    label="Item Name"
                    name="item"
                    placeholder="e.g. School books"
                    required
                  />

                  <SelectField
                    label="Category"
                    name="category"
                    required
                    options={[
                      "Mobile",
                      "Laptop",
                      "Desktop Computer",
                      "Tablet",
                      "Monitor",
                      "Printer",
                      "Camera",
                      "Gaming Console",
                    ]}
                  />

                  <SelectField
                    label="Organisation"
                    name="organisation"
                    required
                    options={partners
                      .filter((partner) => partner.type === "ngo")
                      .map((partner) => partner.name)}
                  />

                  <DateField
                    label="Preferred Date"
                    name="date"
                  />

                  <CountryField />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />

                  <FormField
                    label="Full Name"
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />

                  <FormField
                    label="Gmail / Email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    required
                  />

                  <FormField
                    label="Address"
                    name="address"
                    placeholder="Pickup address"
                    autoComplete="street-address"
                    required
                  />

                </div>


                <button
                  className="primaryButton"
                  type="submit"
                >
                  Confirm Donation
                  <Heart size={17} />
                </button>

              </form>

            )}


            {/* RECYCLE */}

            {modal === "recycle" && (

              <form
                onSubmit={handleRecycle}
              >

                <div className="modalEyebrow">
                  RESPONSIBLE RECYCLING
                </div>

                <h2>
                  Schedule a Pickup
                </h2>

                <div className="formGrid">

                  <FormField
                    label="Item"
                    name="item"
                    placeholder="e.g. Old laptop"
                  
                    required/>

                  <FormField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    placeholder="1"
                  
                    required/>

                  <DateField
                    label="Pickup Date"
                    name="date"
                  />

                  <FormField
                    label="Pickup Time"
                    name="time"
                    type="time"
                    required
                    min="09:00"
                    max="20:00"
                    step="900"
                  />

                  <FormField
                    label="Full Name"
                    name="name"
                    placeholder="Your name"
                    autoComplete="name"
                  
                    required/>

                  <FormField
                    label="Gmail / Email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    autoComplete="email"
                    required
                  />

                  <CountryField />

                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />

                  <FormField
                    label="Address"
                    name="address"
                    placeholder="Pickup address"
                    autoComplete="street-address"
                  
                    required/>

                  <FormField
                    label="City"
                    name="city"
                    placeholder="Mumbai"
                    required
                  />

                </div>


                <button
                  className="primaryButton"
                  type="submit"
                >
                  Confirm Pickup
                  <Recycle size={18} />
                </button>

              </form>

            )}


            {/* SWAP */}

            {modal === "swap" && (

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  makeSubmission(
                    "SW",
                    "Swap request submitted",
                    "Your swap request has been submitted successfully. Keep your Tracking ID for tracking.",
                    [
                      ["User Item", String(form.get("item") || "")],
                      ["Looking For", String(form.get("looking") || "")],
                      ["Category", String(form.get("category") || "")],
                      ["City", String(form.get("city") || "")],
                    ],
                  );
                }}
              >

                <div className="modalEyebrow">
                  SWAP MARKETPLACE
                </div>

                <h2>
                  Find your next exchange.
                </h2>

                <div className="formGrid">

                  <FormField
                    label="Your Item"
                    name="item"
                    placeholder="What do you want to swap?"
                  
                    required/>

                  <FormField
                    label="Looking For"
                    name="looking"
                    placeholder="What would you like?"
                  
                    required/>

                  <SelectField
                    label="Category"
                    name="category"
                    required
                    options={[
                      "Mobile",
                      "Laptop",
                      "Desktop Computer",
                      "Tablet",
                      "Monitor",
                      "Printer",
                      "Camera",
                      "Gaming Console",
                    ]}
                  />

                  <FormField
                    label="City"
                    name="city"
                    placeholder="Mumbai"
                    required
                  />

                </div>


                <div className="swapPreview">

                  <div>
                    <Package size={22} />
                    <span>
                      Your item
                    </span>
                  </div>

                  <Recycle size={25} />

                  <div>
                    <Sparkles size={22} />
                    <span>
                      Matched item
                    </span>
                  </div>

                </div>


                <button
                  className="primaryButton"
                  type="submit"
                >
                  Find Matches
                  <ArrowRight size={18} />
                </button>

              </form>

            )}


            {/* TRACK */}

            {modal === "track" && (
              <TrackModal
                activities={activities}
                isAdmin={adminLoggedIn}
                onClose={closeModal}
                onNotify={addNotification}
              />
            )}

            {/* NOTIFICATIONS */}

            {modal === "notifications" && (
              <NotificationsModal
                notifications={notifications}
                onClose={closeModal}
                onClear={() => {
                  setNotifications([]);
                  notify("Notifications cleared.");
                }}
              />
            )}

            {/* PROFILE */}

            {modal === "profile" && adminLoggedIn && (
              <ProfileModal onClose={closeModal} />
            )}

            {/* ADMIN */}

            {modal === "admin" && (

              adminLoggedIn ? (

                <AdminDashboard
                  activities={[...backendActivities, ...activities].slice(0, 100)}
                  pendingListings={pendingListings}
                  approvedAdminListings={approvedAdminListings}
                  onApprove={async (id, listing) => {
                    try {
                      await reviewListing(adminToken, id, "approved");
                      const approved = await fetchApprovedListings();
                      setApprovedListings(approved);
                      const approvedForAdmin = await fetchPendingListings(adminToken, "approved");
                      setApprovedAdminListings(approvedForAdmin);
                      setActivities((prev) => prev.map((activity) =>
                        activity.type === "Sell" && activity.description.toLowerCase().startsWith(`${String(listing.name || "").toLowerCase()} ·`)
                          ? { ...activity, status: "Approved" }
                          : activity
                      ));
                      addNotification(`Your listing "${listing.name}" has been approved and is now visible in the marketplace.`);
                      notify("Listing approved and added to the marketplace.");
                      return true;
                    } catch (error) {
                      notify(error instanceof Error ? error.message : "Unable to approve listing.");
                      return false;
                    }
                  }}
                  onReject={async (id, listing) => {
                    try {
                      await reviewListing(adminToken, id, "rejected");
                      setActivities((prev) => prev.map((activity) =>
                        activity.type === "Sell" && activity.description.toLowerCase().startsWith(`${String(listing.name || "").toLowerCase()} ·`)
                          ? { ...activity, status: "Rejected" }
                          : activity
                      ));
                      addNotification(`Your listing "${listing.name}" was rejected by the administrator.`);
                      notify("Listing rejected.");
                      return true;
                    } catch (error) {
                      notify(error instanceof Error ? error.message : "Unable to reject listing.");
                      return false;
                    }
                  }}
                  onDelete={async (id, listing) => {
                    try {
                      await deleteListing(adminToken, id);
                      setPendingListings((prev) => prev.filter((item) => String(item.id) !== String(id)));
                      setApprovedAdminListings((prev) => prev.filter((item) => String(item.id) !== String(id)));
                      setApprovedListings((prev) => prev.filter((item) => String(item.id) !== String(id)));
                      addNotification(`Listing "${listing.name}" was deleted by the administrator.`);
                      notify("Listing deleted successfully.");
                      return true;
                    } catch (error) {
                      notify(error instanceof Error ? error.message : "Unable to delete listing.");
                      return false;
                    }
                  }}
                  onClose={() => {
                    setAdminLoggedIn(false);
                    setAdminSigningIn(false);
                    closeModal();
                  }}
                  onLogout={() => {
                    sessionStorage.removeItem("circularhub_admin_token");
                    setAdminToken("");
                    setAdminLoggedIn(false);
                    setAdminSigningIn(false);
                    closeModal();
                  }}
                />

              ) : (

                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (adminSigningIn) return;

                    const form = new FormData(event.currentTarget);
                    const adminName = String(form.get("adminName") || "").trim();
                    const password = String(form.get("password") || "");

                    setAdminSigningIn(true);

                    try {
                      const result = await adminLogin(adminName, password);
                      sessionStorage.setItem("circularhub_admin_token", result.token);
                      setAdminToken(result.token);
                      setAdminLoggedIn(true);
                      setModal("admin");
                      notify("Admin login successful. Dashboard unlocked.");
                      window.setTimeout(() => {
                        document.getElementById("dashboard")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }, 80);
                    } catch (error) {
                      notify(error instanceof Error ? error.message : "Invalid administrator credentials.");
                    } finally {
                      setAdminSigningIn(false);
                    }
                  }}
                >

                  <div className="modalEyebrow">
                    ADMIN CONTROL CENTER
                  </div>

                  <h2>
                    Admin Login
                  </h2>

                  <p className="formIntro">
                    Authorized administrators only.
                  </p>

                  <FormField
                    label="Admin Name"
                    name="adminName"
                    placeholder="admin"
                    autoComplete="username"
                    required
                  />

                  <FormField
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    className="primaryButton full"
                    type="submit"
                    disabled={adminSigningIn}
                    aria-busy={adminSigningIn}
                  >
                    {adminSigningIn ? "Signing in…" : "Sign In"}
                    {adminSigningIn ? <RotateCw size={18} style={{ animation: "spin 0.8s linear infinite" }} /> : <ShieldCheck size={18} />}
                  </button>

                </form>

              )

            )}

          </div>

        </div>

      )}

      {submission && (
        <SubmissionModal
          submission={submission}
          onClose={() => setSubmission(null)}
          onNotify={notify}
        />
      )}

    </div>
  );
}


/* =====================================================
   FORM COMPONENTS
===================================================== */

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
  min,
  max,
  step,
  pattern,
  maxLength,
  prefix,
  inputMode,
  digitsOnly = false,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  maxLength?: number;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  digitsOnly?: boolean;
}) {
  return (
    <label className="field">

      <span>
        {label}
      </span>

      {prefix ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "14px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.025)",
          }}
        >
          <span
            style={{
              padding: "0 12px",
              color: "rgba(255,255,255,0.72)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {prefix}
          </span>
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            required={required}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            maxLength={maxLength}
            inputMode={inputMode}
            style={{ border: 0, borderRadius: 0, flex: 1 }}
            onInput={(event) => {
              if (digitsOnly) {
                event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, maxLength);
              }
            }}
            onClick={(event) => {
              const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
              if (type === "time" || type === "date") input.showPicker?.();
            }}
          />
        </div>
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          maxLength={maxLength}
          inputMode={inputMode}
          onInput={(event) => {
            if (digitsOnly) {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, maxLength);
            }
          }}
          onClick={(event) => {
            const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
            if (type === "time" || type === "date") input.showPicker?.();
          }}
        />
      )}

    </label>
  );
}


function SelectField({
  label,
  name,
  options,
  required = true,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="field">

      <span>
        {label}
      </span>

      <div className="selectWrapper">

        <select name={name} required={required}>

          {options.map((option) => (
            <option
              value={option}
              key={option}
            >
              {option}
            </option>
          ))}

        </select>

        <ChevronDown size={17} />

      </div>

    </label>
  );
}


function DateField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <label className="field">

      <span>
        {label}
      </span>

      <div className="dateWrapper">

        <input
          name={name}
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          onClick={(event) => {
            const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
            input.showPicker?.();
          }}
        />

        <CalendarDays size={17} />

      </div>

    </label>
  );
}


function CountryField() {
  return (
    <label className="field">

      <span>
        Country
      </span>

      <div className="selectWrapper">

        <select name="country" required>

          <option value="+91">
            🇮🇳 India +91
          </option>

          <option value="+1">
            🇺🇸 USA +1
          </option>

          <option value="+44">
            🇬🇧 United Kingdom +44
          </option>

          <option value="+971">
            🇦🇪 UAE +971
          </option>

          <option value="+61">
            🇦🇺 Australia +61
          </option>

          <option value="+65">
            🇸🇬 Singapore +65
          </option>

          <option value="+49">
            🇩🇪 Germany +49
          </option>

          <option value="+33">
            🇫🇷 France +33
          </option>

          <option value="+81">
            🇯🇵 Japan +81
          </option>

          <option value="+1">
            🇨🇦 Canada +1
          </option>

        </select>

        <ChevronDown size={17} />

      </div>

    </label>
  );
}


/* =====================================================
   SUBMISSION / INVOICE MODAL
===================================================== */

function SubmissionModal({
  submission,
  onClose,
  onNotify,
}: {
  submission: {
    trackingId: string;
    title: string;
    message: string;
    fields: Array<[string, string]>;
    amount?: number;
  };
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const buildInvoiceHtml = () => {
    const rows = submission.fields
      .map(([label, value]) =>
        `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value || "—")}</td></tr>`
      )
      .join("");

    return `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CircularHub Invoice ${escapeHtml(submission.trackingId)}</title><style>*{box-sizing:border-box}body{margin:0;padding:40px;font-family:Arial,Helvetica,sans-serif;background:#f5f7f6;color:#17211f}.invoice{max-width:760px;margin:auto;background:#fff;border:1px solid #dce5e1;border-radius:18px;padding:34px}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:1px solid #e6ece9;padding-bottom:24px;margin-bottom:24px}.brand{font-size:26px;font-weight:800}.brand span{color:#7c3aed}.muted{color:#6b7773;font-size:13px;line-height:1.6}.ref{font-size:13px;color:#6b7773;margin-top:4px}h1{font-size:26px;margin:6px 0 10px}table{width:100%;border-collapse:collapse;margin-top:18px}td{padding:13px 0;border-bottom:1px solid #edf1ef;font-size:14px;vertical-align:top}td:first-child{color:#66736e;width:36%}td:last-child{font-weight:600;text-align:right}.success{margin:24px 0;padding:16px;border-radius:12px;background:#ecfdf5;color:#166534;font-weight:700}.footer{margin-top:28px;padding-top:18px;border-top:1px solid #e6ece9;color:#6b7773;font-size:12px;text-align:center}@media(max-width:600px){body{padding:15px}.invoice{padding:20px}.top{flex-direction:column}.top>div:last-child{text-align:left}td:first-child{width:42%}}@media print{body{padding:0;background:#fff}.invoice{border:0;box-shadow:none;border-radius:0;max-width:none}}</style></head><body><main class="invoice"><div class="top"><div><div class="brand">Circular<span>Hub</span></div><div class="muted">Give Products a Second Life.</div></div><div style="text-align:right"><strong>INVOICE / CONFIRMATION</strong><div class="ref">Tracking ID: ${escapeHtml(submission.trackingId)}</div></div></div><h1>${escapeHtml(submission.title)}</h1><div class="muted">Generated on ${escapeHtml(new Date().toLocaleString("en-IN"))}</div><div class="success">Your request has been submitted successfully.</div><table><tbody>${rows}</tbody></table>${submission.amount !== undefined ? `<div style="display:flex;justify-content:space-between;gap:20px;margin-top:22px;padding:16px 0;border-top:2px solid #dce5e1;font-size:17px"><strong>Total</strong><strong style="color:#7c3aed">₹${submission.amount.toLocaleString("en-IN")}</strong></div>` : ""}<div class="footer">CircularHub · Tracking ID ${escapeHtml(submission.trackingId)}</div></main></body></html>`;
  };

  const downloadInvoice = () => {
    const blob = new Blob([buildInvoiceHtml()], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `CircularHub-Invoice-${submission.trackingId}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    onNotify("Invoice downloaded successfully.");
  };

  const printInvoice = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      onNotify("Please allow pop-ups to print the invoice.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(buildInvoiceHtml());
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 350);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <style>{`\n        .freshSubmission{width:min(720px,94vw);max-height:92vh;overflow:auto;padding:26px;background:linear-gradient(160deg,#120c1b 0%,#0b0910 62%,#161020 100%);border:1px solid rgba(192,132,252,.34);box-shadow:0 32px 120px rgba(0,0,0,.62);position:relative}
        .freshSubmission:before{content:"";position:absolute;left:0;top:0;width:5px;height:100%;background:linear-gradient(180deg,#c084fc,#8b5cf6,#2dd4bf);border-radius:30px}
        .freshSuccess{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:15px;padding:16px 18px;border:1px solid rgba(45,212,191,.25);background:linear-gradient(100deg,rgba(45,212,191,.10),rgba(168,85,247,.08));border-radius:18px;margin-bottom:24px}.freshSuccessIcon{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#86efac,#34d399);color:#062c1b;box-shadow:0 0 28px rgba(52,211,153,.18)}.freshSuccessMark{font-size:9px;letter-spacing:.18em;font-weight:900;color:#86efac}.freshSuccessSub{font-size:11px;color:#9d94a7;margin-top:4px}.freshSuccessArrow{font-size:9px;letter-spacing:.12em;color:#c084fc;font-weight:800}
        .freshLabel{font-size:9px;letter-spacing:.17em;font-weight:900;color:#c084fc;text-transform:uppercase}.freshTitle{font-size:34px;line-height:1.05;margin:8px 0 9px;letter-spacing:-.035em}.freshCopy{color:#aaa0b5;font-size:12px;line-height:1.6}.freshId{margin:22px 0;padding:20px 22px;border-radius:18px;background:linear-gradient(135deg,rgba(168,85,247,.16),rgba(45,212,191,.07));border:1px solid rgba(192,132,252,.30);position:relative;overflow:hidden}.freshId:after{content:"";position:absolute;width:150px;height:150px;border-radius:50%;right:-70px;top:-90px;background:rgba(192,132,252,.09)}.freshId span{display:block;font-size:8px;letter-spacing:.17em;color:#aaa0b5;font-weight:900}.freshId strong{display:block;font-size:29px;letter-spacing:.10em;color:#f1e7ff;margin-top:7px}.freshHint{margin-top:7px;color:#91869d;font-size:10px}.freshDetails{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:18px 0}.freshDetail{padding:12px 13px;border:1px solid rgba(192,132,252,.15);border-radius:13px;background:rgba(255,255,255,.022)}.freshDetail span{display:block;font-size:7px;letter-spacing:.12em;color:#94899d;text-transform:uppercase}.freshDetail strong{display:block;margin-top:5px;font-size:11px;word-break:break-word}.freshTrack{display:flex;align-items:center;gap:8px;margin-top:14px;padding:11px 13px;border-radius:12px;background:rgba(45,212,191,.055);border:1px solid rgba(45,212,191,.13);color:#9fe8d9;font-size:10px}.freshTrack svg{flex:0 0 auto}.freshActions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin-top:18px}.freshAction{min-height:50px}.freshAction:last-child{grid-column:auto}@media(max-width:650px){.freshSubmission{padding:22px 18px}.freshTitle{font-size:28px}.freshDetails{grid-template-columns:1fr}.freshActions{grid-template-columns:1fr}.freshSuccess{grid-template-columns:auto 1fr}.freshSuccessArrow{display:none}}
      `}</style>
      <div className="modalBox freshSubmission" onClick={(event) => event.stopPropagation()}>
        <div className="freshSuccess">
          <div className="freshSuccessIcon"><Check size={25} /></div>
          <div>
            <div className="freshSuccessMark">CIRCULARHUB RECEIVED IT</div>
            <div className="freshSuccessSub">Your request is now in the circular workflow.</div>
          </div>
          <span className="freshSuccessArrow">ID READY</span>
        </div>
        <div className="freshLabel">NEXT STEP</div>
        <h2 className="freshTitle">You're all set.</h2>
        <p className="freshCopy">{submission.message}</p>
        <div className="freshLabel" style={{marginTop:12}}>{submission.title}</div>

        <div className="freshId">
          <span>YOUR ONE TRACKING ID</span>
          <strong>{submission.trackingId}</strong>
          <div className="freshHint">Save this single ID. Use it anytime from Track.</div>
        </div>

        <div className="freshDetails">
          {submission.fields.map(([label, value]) => (
            <div className="freshDetail" key={label}>
              <span>{label}</span>
              <strong>{value || "—"}</strong>
            </div>
          ))}
        </div>

        {submission.amount !== undefined && (
          <div className="freshId" style={{marginTop:10}}>
            <span>TOTAL</span>
            <strong>₹{submission.amount.toLocaleString("en-IN")}</strong>
          </div>
        )}

        <div className="freshTrack"><Package size={16} /> Only your Tracking ID is needed to check this request.</div>

        <div className="freshActions">
          <button className="primaryButton freshAction" onClick={downloadInvoice}><Download size={17} /> Download Invoice</button>
          <button className="secondaryButton freshAction" onClick={printInvoice}><Printer size={17} /> Print Invoice</button>
          <button className="secondaryButton freshAction" onClick={onClose}><Check size={17} /> Done</button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   TRACKING + NOTIFICATIONS
===================================================== */

function TrackModal({
  activities,
  isAdmin,
  onClose,
  onNotify,
}: {
  activities: ActivityRecord[];
  isAdmin: boolean;
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const normalized = query.trim().toLowerCase();
  const result = searched && normalized
    ? activities.find((activity) =>
        String(activity.trackingId || "").toLowerCase() === normalized
      )
    : undefined;

  const trackRequest = () => {
    if (!normalized) {
      setSearched(false);
      onNotify("Enter your Tracking ID to continue.");
      return;
    }
    setSearched(true);
    onNotify(
      result
        ? `Tracking ID ${result.trackingId} found.`
        : "No request was found for that Tracking ID."
    );
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox trackModal" onClick={(event) => event.stopPropagation()}>
        <button className="closeModal" onClick={onClose}><X size={20} /></button>
        <div className="modalEyebrow">REQUEST TRACKING</div>
        <h2>{isAdmin ? "Activity control room." : "Follow your request."}</h2>
        <p className="formIntro">
          {isAdmin
            ? "Administrator access. Enter a Tracking ID to inspect one request, or use the private admin activity list below to review the complete history."
            : "Enter the Tracking ID given to you after submitting a request. Only your matching request is shown; no other activity is visible."}
        </p>

        <div className="trackSearch">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearched(false);
            }}
            placeholder="Enter your Tracking ID"
            aria-label="Tracking ID"
          />
          <button type="button" onClick={trackRequest}>Track</button>
        </div>

        {result ? (
          <div className="trackingResult">
            <div className="trackingResultTop">
              <div>
                <span>TRACKING ID</span>
                <strong>{result.trackingId}</strong>
              </div>
              <b>{result.status || "Submitted"}</b>
            </div>
            <h3>{result.title}</h3>
            <p>{result.description}</p>
            <div className="trackingMeta">
              <span>Type <strong>{result.type}</strong></span>
              <span>Created <strong>{new Date(result.timestamp).toLocaleString("en-IN")}</strong></span>
            </div>
            <div className="trackingSteps">
              <span className="done">Submitted</span>
              <span className={result.status && result.status !== "Submitted" ? "done" : ""}>Processing</span>
              <span className={result.status === "Completed" || result.status === "Delivered" ? "done" : ""}>Completed</span>
            </div>
          </div>
        ) : (
          <div className="trackEmpty">
            <Package size={26} />
            <strong>{searched ? "Tracking ID not found" : "Your tracking details stay private"}</strong>
            <span>
              {searched
                ? "Check the ID from your submission confirmation and try again."
                : "Only the request linked to the Tracking ID you enter will be displayed."}
            </span>
          </div>
        )}

        {isAdmin && (
          <div style={{marginTop:22}}>
            <div className="modalEyebrow">ADMIN-ONLY HISTORY</div>
            <h3 style={{margin:"7px 0 12px"}}>All CircularHub activity</h3>
            {activities.length ? (
              <div style={{display:"grid",gap:9,maxHeight:260,overflowY:"auto",paddingRight:3}}>
                {activities.map((activity) => (
                  <div key={`track-admin-${activity.trackingId}`} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,padding:"12px 14px",border:"1px solid rgba(192,132,252,.18)",borderRadius:13,background:"rgba(168,85,247,.045)"}}>
                    <div>
                      <strong style={{display:"block",fontSize:11}}>{activity.title}</strong>
                      <span style={{display:"block",marginTop:4,color:"var(--muted)",fontSize:10}}>{activity.description}</span>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <strong style={{display:"block",fontSize:10,color:"var(--purple2)",letterSpacing:".05em"}}>{activity.trackingId}</strong>
                      <span style={{display:"block",marginTop:4,color:"var(--muted)",fontSize:9}}>{activity.type} · {activity.status || "Submitted"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="trackEmpty"><span>No activities have been submitted yet.</span></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsModal({
  notifications,
  onClose,
  onClear,
}: {
  notifications: string[];
  onClose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox notificationsModal" onClick={(event) => event.stopPropagation()}>
        <button className="closeModal" onClick={onClose}><X size={20} /></button>
        <div className="modalEyebrow">NOTIFICATIONS</div>
        <h2>Your latest updates.</h2>
        <p className="formIntro">CircularHub keeps important activity and tracking updates here.</p>
        <div className="notificationList">
          {notifications.length ? notifications.map((message, index) => (
            <div className="notificationItem" key={`${message}-${index}`}>
              <div className="notificationItemIcon"><Bell size={17} /></div>
              <div><strong>{index === 0 ? "New update" : "CircularHub"}</strong><span>{message}</span></div>
            </div>
          )) : <div className="trackEmpty"><Bell size={25} /><strong>No new notifications</strong><span>You are all caught up.</span></div>}
        </div>
        <div className="modalButtons">
          <button className="secondaryButton" onClick={onClear}>Clear notifications</button>
          <button className="primaryButton" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

function AdminDashboard({
  activities,
  pendingListings,
  approvedAdminListings,
  onApprove,
  onReject,
  onDelete,
  onClose,
  onLogout,
}: {
  activities: ActivityRecord[];
  pendingListings: Array<any>;
  approvedAdminListings: Array<any>;
  onApprove: (id: string, listing: any) => Promise<boolean>;
  onReject: (id: string, listing: any) => Promise<boolean>;
  onDelete: (id: string, listing: any) => Promise<boolean>;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [decisions, setDecisions] = useState<Record<string, "approved" | "rejected">>({});

  const approve = async (listing: any) => {
    const id = String(listing.id);
    if (decisions[id]) return;
    const success = await onApprove(id, listing);
    if (success) {
      setDecisions((prev) => ({ ...prev, [id]: "approved" }));
    }
  };

  const reject = async (listing: any) => {
    const id = String(listing.id);
    if (decisions[id]) return;
    const success = await onReject(id, listing);
    if (success) {
      setDecisions((prev) => ({ ...prev, [id]: "rejected" }));
    }
  };

  const remove = async (listing: any) => {
    const id = String(listing.id);
    if (decisions[id]) return;

    const confirmed = window.confirm(
      `Delete this listing from ${listing.seller || "this user"}?`
    );

    if (!confirmed) return;
    await onDelete(id, listing);
  };

  const removeApproved = async (listing: any) => {
    const confirmed = window.confirm(
      `Delete "${listing.name}" from the marketplace?`
    );

    if (!confirmed) return;
    await onDelete(String(listing.id), listing);
  };

  return (
    <div>
      <div className="adminHeader">
        <div>
          <div className="modalEyebrow">ADMIN CONTROL CENTER</div>
          <h2>CircularHub Admin</h2>
        </div>
        <button className="outlineButton" onClick={onLogout}>Log out</button>
      </div>

      <div className="adminStats">
        <div><span>USERS</span><strong>2,840</strong></div>
        <div><span>LISTINGS</span><strong>428</strong></div>
        <div><span>REPAIRS</span><strong>196</strong></div>
        <div><span>ACTIVITIES</span><strong>{activities.length}</strong></div>
      </div>

      <div className="adminReviewPanel">
        <div className="modalEyebrow">LISTING APPROVALS</div>
        <h3>Pending user listings</h3>
        <p className="formIntro">
          User-submitted products are stored in the backend first. They appear in the marketplace only after an administrator approves them.
        </p>

        {pendingListings.length ? (
          <div className="adminPendingList">
            {pendingListings.map((listing) => {
              const id = String(listing.id);
              const decision = decisions[id];
              const isApproved = decision === "approved";
              const isRejected = decision === "rejected";

              return (
                <div className="adminPendingCard" key={id}>
                  <div className="adminPendingImage">
                    <img
                      src={listing.image || getConditionImage(listing.category, listing.condition)}
                      alt={listing.name}
                    />
                  </div>

                  <div className="adminPendingInfo">
                    <strong>{listing.name}</strong>
                    <span>{listing.brand} · {listing.category} · {listing.condition}</span>
                    <span>{listing.seller} · {listing.city}</span>
                    <b>₹{Number(listing.price || 0).toLocaleString("en-IN")}</b>
                    {decision && (
                      <span style={{
                        display: "inline-flex",
                        width: "fit-content",
                        marginTop: 6,
                        padding: "5px 9px",
                        borderRadius: 999,
                        border: `1px solid ${isApproved ? "rgba(52,211,153,.35)" : "rgba(248,113,113,.35)"}`,
                        background: isApproved ? "rgba(16,185,129,.10)" : "rgba(239,68,68,.10)",
                        color: isApproved ? "#6ee7b7" : "#fca5a5",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: ".04em",
                      }}>
                        {isApproved ? "APPROVED" : "REJECTED"}
                      </span>
                    )}
                  </div>

                  <div className="adminPendingActions">
                    <button
                      type="button"
                      className="primaryButton"
                      disabled={Boolean(decision)}
                      onClick={() => void approve(listing)}
                      style={isApproved ? {
                        background: "linear-gradient(135deg, #22c55e, #10b981)",
                        borderColor: "rgba(110,231,183,.55)",
                        boxShadow: "0 0 0 2px rgba(52,211,153,.18), 0 10px 28px rgba(16,185,129,.25)",
                        color: "#fff",
                      } : undefined}
                    >
                      {isApproved ? "Approved ✓" : "Approve"}
                    </button>

                    <button
                      type="button"
                      className="secondaryButton"
                      disabled={Boolean(decision)}
                      onClick={() => void reject(listing)}
                      style={isRejected ? {
                        background: "rgba(239,68,68,.16)",
                        borderColor: "rgba(248,113,113,.55)",
                        boxShadow: "0 0 0 2px rgba(248,113,113,.14), 0 10px 28px rgba(239,68,68,.16)",
                        color: "#fca5a5",
                      } : undefined}
                    >
                      {isRejected ? "Rejected ✕" : "Reject"}
                    </button>

                    <button
                      type="button"
                      className="secondaryButton"
                      disabled={Boolean(decision)}
                      onClick={() => void remove(listing)}
                      style={{
                        borderColor: "rgba(248,113,113,.55)",
                        background: "rgba(239,68,68,.10)",
                        color: "#fca5a5",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="trackEmpty">
            <Check size={25} />
            <strong>No pending listings</strong>
            <span>New user listings will appear here for review.</span>
          </div>
        )}
      </div>

      <div className="adminReviewPanel" style={{ marginTop: 24 }}>
        <div className="modalEyebrow">APPROVED MARKETPLACE LISTINGS</div>
        <h3>Live products</h3>
        <p className="formIntro">
          These products are currently visible on the buying page. Delete any product that should no longer be available.
        </p>

        {approvedAdminListings.length ? (
          <div className="adminPendingList">
            {approvedAdminListings.map((listing) => (
              <div className="adminPendingCard" key={`approved-${listing.id}`}>
                <div className="adminPendingImage">
                  <img
                    src={listing.image || getConditionImage(listing.category, listing.condition)}
                    alt={listing.name}
                  />
                </div>

                <div className="adminPendingInfo">
                  <strong>{listing.name}</strong>
                  <span>{listing.brand} · {listing.category} · {listing.condition}</span>
                  <span>{listing.seller} · {listing.city}</span>
                  <b>₹{Number(listing.price || 0).toLocaleString("en-IN")}</b>
                  <span style={{
                    display: "inline-flex",
                    width: "fit-content",
                    marginTop: 6,
                    padding: "5px 9px",
                    borderRadius: 999,
                    border: "1px solid rgba(52,211,153,.35)",
                    background: "rgba(16,185,129,.10)",
                    color: "#6ee7b7",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: ".04em",
                  }}>
                    APPROVED · LIVE
                  </span>
                </div>

                <div className="adminPendingActions">
                  <button
                    type="button"
                    className="secondaryButton"
                    onClick={() => void removeApproved(listing)}
                    style={{
                      borderColor: "rgba(248,113,113,.55)",
                      background: "rgba(239,68,68,.10)",
                      color: "#fca5a5",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="trackEmpty">
            <Check size={25} />
            <strong>No approved marketplace listings</strong>
            <span>Approved products will appear here while they are live.</span>
          </div>
        )}
      </div>

      <div className="adminTable">
        <div className="adminTableHeader">
          <span>Item / Request</span><span>Type</span><span>Status</span><span>Tracking ID</span>
        </div>
        {activities.length ? activities.map((activity) => (
          <div className="adminTableRow" key={`admin-${activity.trackingId}`}>
            <span>{activity.description.split(" · ")[0]}</span>
            <span>{activity.type}</span>
            <span className={activity.status === "Submitted" ? "statusPending" : "statusGood"}>{activity.status || "Submitted"}</span>
            <strong>{activity.trackingId}</strong>
          </div>
        )) : (
          <div className="adminTableRow"><span>No activities yet</span><span>—</span><span>—</span><strong>—</strong></div>
        )}
      </div>

      <div style={{marginTop:24,padding:18,border:"1px solid rgba(192,132,252,.2)",borderRadius:16,background:"rgba(168,85,247,.05)"}}>
        <div className="modalEyebrow">ALL USER ACTIVITY</div>
        <p style={{color:"var(--muted)",fontSize:12,marginTop:7}}>
          Admin access only. Every submitted sell, swap, order, repair, donation and recycle request is listed here with its single Tracking ID.
        </p>
      </div>

      <button className="secondaryButton" onClick={onClose} style={{marginTop:18}}>Close dashboard</button>
    </div>
  );
}

function ProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalBox" onClick={(event) => event.stopPropagation()}>
        <button className="closeModal" onClick={onClose}><X size={20} /></button>
        <div className="modalEyebrow">ADMIN PROFILE</div>
        <h2>Admin profile</h2>
        <div className="submissionDetails">
          <div><span>NAME</span><strong>Admin</strong></div>
          <div><span>ROLE</span><strong>System Administrator</strong></div>
          <div><span>ACCESS</span><strong>Full activity management</strong></div>
          <div><span>STATUS</span><strong>Authenticated</strong></div>
        </div>
        <button className="primaryButton full" onClick={onClose}>Done <Check size={17} /></button>
      </div>
    </div>
  );
}


export default App;