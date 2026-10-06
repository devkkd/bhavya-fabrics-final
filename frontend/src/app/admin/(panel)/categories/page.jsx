"use client";

import {
  useEffect,
  useState
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  FolderTree,
  X,
  Save,
  Loader2,
  Search
} from "lucide-react";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

const emptyCategory = {
  name: "",
  slug: "",
  image: {
    url: "",
    alt: ""
  },
  heroImage: {
    url: "",
    alt: ""
  },
  homeImage: {
    url: "",
    alt: ""
  },
  description: "",
  metaTitle: "",
  metaDescription: "",
  showOnHome: false,
  showInNavigation: true,
  status: "published"
};

const emptySubCategory = {
  name: "",
  slug: "",
  category: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  showOnHome: false,
  status: "published"
};

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [subCategories, setSubCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("categories");

  const [search, setSearch] =
    useState("");

  const [categoryFormOpen, setCategoryFormOpen] =
    useState(false);

  const [subCategoryFormOpen, setSubCategoryFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [editingSubCategory, setEditingSubCategory] =
    useState(null);

  const [categoryForm, setCategoryForm] =
    useState(emptyCategory);

  const [subCategoryForm, setSubCategoryForm] =
    useState(emptySubCategory);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Categories
  |--------------------------------------------------------------------------
  */

  const loadCategories =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/categories/admin/all`,
            {
              credentials:
                "include",
              cache: "no-store"
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load categories"
          );
        }

        setCategories(
          data.categories || []
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load categories"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Load Subcategories
  |--------------------------------------------------------------------------
  */

  const loadSubCategories =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/subcategories/admin/all`,
            {
              credentials:
                "include",
              cache: "no-store"
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load subcategories"
          );
        }

        setSubCategories(
          data.subCategories ||
            []
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load subcategories"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const load =
      async () => {
        setLoading(true);
        setError("");

        await Promise.all([
          loadCategories(),
          loadSubCategories()
        ]);

        setLoading(false);
      };

    load();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Toast
  |--------------------------------------------------------------------------
  */

  const showSuccess =
    (message) => {
      setSuccess(message);

      window.setTimeout(
        () => {
          setSuccess("");
        },
        2500
      );
    };

  const uploadCategoryImage = async (
    file,
    type = "category"
  ) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("type", type);
    formData.append("filename", file.name);

    const response = await fetch(
      `${API_URL}/uploads/direct`,
      {
        method: "POST",
        credentials: "include",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Image upload failed"
      );
    }

    return {
      url:
        data.upload?.url ||
        data.upload?.imageUrl ||
        data.upload?.deliveryUrl ||
        data.url ||
        data.imageUrl ||
        "",
      cloudflareId:
        data.upload?.cloudflareId ||
        data.cloudflareId ||
        "",
      alt: file.name || ""
    };
  };

  const handleCategoryImageUpload = async (
    event,
    key
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await uploadCategoryImage(
        file,
        key === "homeImage"
          ? "category"
          : "category"
      );

      if (!result) {
        return;
      }

      setCategoryForm((current) => ({
        ...current,
        [key]: {
          url: result.url,
          alt:
            current[key]?.alt ||
            file.name ||
            ""
        }
      }));

      showSuccess("Category image uploaded");
    } catch (error) {
      setError(
        error.message || "Image upload failed"
      );
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Category Open
  |--------------------------------------------------------------------------
  */

  const openCategoryCreate =
    () => {
      setEditingCategory(null);
      setCategoryForm(
        emptyCategory
      );
      setCategoryFormOpen(true);
      setError("");
    };

  const openCategoryEdit =
    (category) => {
      setEditingCategory(
        category
      );

      setCategoryForm({
        name:
          category.name || "",
        slug:
          category.slug || "",
        image: {
          url:
            category.image?.url ||
            "",
          alt:
            category.image?.alt ||
            ""
        },
        heroImage: {
          url:
            category.heroImage?.url ||
            category.image?.url ||
            "",
          alt:
            category.heroImage?.alt ||
            category.image?.alt ||
            ""
        },
        homeImage: {
          url:
            category.homeImage?.url ||
            category.image?.url ||
            "",
          alt:
            category.homeImage?.alt ||
            category.image?.alt ||
            ""
        },
        description:
          category.description ||
          "",
        metaTitle:
          category.metaTitle ||
          "",
        metaDescription:
          category.metaDescription ||
          "",
        showOnHome:
          Boolean(
            category.showOnHome
          ),
        showInNavigation:
          category.showInNavigation !==
          undefined
            ? Boolean(
                category.showInNavigation
              )
            : true,
        status:
          category.status ||
          "published"
      });

      setCategoryFormOpen(
        true
      );

      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | Subcategory Open
  |--------------------------------------------------------------------------
  */

  const openSubCategoryCreate =
    () => {
      setEditingSubCategory(
        null
      );

      setSubCategoryForm(
        emptySubCategory
      );

      setSubCategoryFormOpen(
        true
      );

      setError("");
    };

  const openSubCategoryEdit =
    (subCategory) => {
      setEditingSubCategory(
        subCategory
      );

      setSubCategoryForm({
        name:
          subCategory.name ||
          "",

        slug:
          subCategory.slug ||
          "",

        category:
          subCategory.category?._id ||
          subCategory.category ||
          "",

        description:
          subCategory.description ||
          "",

        metaTitle:
          subCategory.metaTitle ||
          "",

        metaDescription:
          subCategory.metaDescription ||
          "",

        showOnHome:
          Boolean(
            subCategory.showOnHome
          ),

        status:
          subCategory.status ||
          "published"
      });

      setSubCategoryFormOpen(
        true
      );

      setError("");
    };

  /*
  |--------------------------------------------------------------------------
  | Category Save
  |--------------------------------------------------------------------------
  */

  const saveCategory =
    async (event) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        const isEdit =
          Boolean(
            editingCategory
          );

        const url = isEdit
          ? `${API_URL}/categories/${editingCategory._id}`
          : `${API_URL}/categories`;

        const response =
          await fetch(url, {
            method:
              isEdit
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "include",

            body: JSON.stringify(
              categoryForm
            )
          });

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to save category"
          );
        }

        await loadCategories();

        setCategoryFormOpen(
          false
        );

        setEditingCategory(
          null
        );

        setCategoryForm(
          emptyCategory
        );

        showSuccess(
          isEdit
            ? "Category updated successfully"
            : "Category created successfully"
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to save category"
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Subcategory Save
  |--------------------------------------------------------------------------
  */

  const saveSubCategory =
    async (event) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      if (
        !subCategoryForm.category
      ) {
        setError(
          "Please select a parent category"
        );

        return;
      }

      setSaving(true);
      setError("");

      try {
        const isEdit =
          Boolean(
            editingSubCategory
          );

        const url = isEdit
          ? `${API_URL}/subcategories/${editingSubCategory._id}`
          : `${API_URL}/subcategories`;

        const response =
          await fetch(url, {
            method:
              isEdit
                ? "PUT"
                : "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            credentials:
              "include",

            body: JSON.stringify(
              subCategoryForm
            )
          });

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to save subcategory"
          );
        }

        await loadSubCategories();

        setSubCategoryFormOpen(
          false
        );

        setEditingSubCategory(
          null
        );

        setSubCategoryForm(
          emptySubCategory
        );

        showSuccess(
          isEdit
            ? "Subcategory updated successfully"
            : "Subcategory created successfully"
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to save subcategory"
        );
      } finally {
        setSaving(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete Category
  |--------------------------------------------------------------------------
  */

  const deleteCategory =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this category?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        const response =
          await fetch(
            `${API_URL}/categories/${id}`,
            {
              method: "DELETE",
              credentials:
                "include"
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to delete category"
          );
        }

        await loadCategories();

        showSuccess(
          "Category deleted successfully"
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to delete category"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Delete Subcategory
  |--------------------------------------------------------------------------
  */

  const deleteSubCategory =
    async (id) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this subcategory?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        const response =
          await fetch(
            `${API_URL}/subcategories/${id}`,
            {
              method: "DELETE",
              credentials:
                "include"
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to delete subcategory"
          );
        }

        await loadSubCategories();

        showSuccess(
          "Subcategory deleted successfully"
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to delete subcategory"
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const searchValue =
    search.trim().toLowerCase();

  const filteredCategories =
    categories.filter(
      (item) =>
        item.name
          ?.toLowerCase()
          .includes(
            searchValue
          )
    );

  const filteredSubCategories =
    subCategories.filter(
      (item) =>
        item.name
          ?.toLowerCase()
          .includes(
            searchValue
          ) ||
        item.category?.name
          ?.toLowerCase()
          .includes(
            searchValue
          )
    );

  /*
  |--------------------------------------------------------------------------
  | Styles
  |--------------------------------------------------------------------------
  */

  const styles = {
    page: {
      width: "100%"
    },

    intro: {
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: "18px",
      marginBottom: "22px"
    },

    heading: {
      margin: 0,
      color: "#292828",
      fontFamily:
        "Georgia, serif",
      fontSize: "24px",
      fontWeight: "600"
    },

    description: {
      margin:
        "6px 0 0",
      color: "#77736D",
      fontSize: "11px"
    },

    primaryButton: {
      height: "40px",
      padding:
        "0 15px",
      border: 0,
      borderRadius: "8px",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      gap: "7px",
      fontSize: "11px",
      fontWeight: "700",
      cursor: "pointer",
      flexShrink: 0
    },

    tabsCard: {
      background: "#FAF8F5",
      border:
        "1px solid #E1DAD2",
      borderRadius: "12px",
      overflow: "hidden"
    },

    tabs: {
      minHeight: "60px",
      padding:
        "0 18px",
      borderBottom:
        "1px solid #E4DDD5",
      display: "flex",
      alignItems: "center",
      gap: "7px"
    },

    tab: {
      height: "36px",
      padding:
        "0 13px",
      border: 0,
      borderRadius: "7px",
      background:
        "transparent",
      color: "#77736E",
      fontSize: "10px",
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      gap: "7px",
      cursor: "pointer"
    },

    activeTab: {
      background: "#F2EEE9",
      color: "#295C65"
    },

    toolbar: {
      height: "60px",
      padding:
        "0 18px",
      borderBottom:
        "1px solid #E7E0D8",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: "12px"
    },

    search: {
      width: "280px",
      height: "36px",
      boxSizing:
        "border-box",
      border:
        "1px solid #D8D1C8",
      borderRadius: "8px",
      background: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding:
        "0 11px"
    },

    searchInput: {
      width: "100%",
      border: 0,
      outline: 0,
      background:
        "transparent",
      color: "#303030",
      fontSize: "11px"
    },

    count: {
      color: "#88847E",
      fontSize: "9px"
    },

    tableWrapper: {
      width: "100%",
      overflowX: "auto"
    },

    table: {
      width: "100%",
      borderCollapse:
        "collapse",
      minWidth: "760px"
    },

    th: {
      height: "43px",
      padding:
        "0 15px",
      background:
        "#F6F2EE",
      borderBottom:
        "1px solid #E5DED6",
      color: "#7A766F",
      fontSize: "9px",
      fontWeight: "700",
      textAlign:
        "left",
      textTransform:
        "uppercase",
      letterSpacing:
        "0.6px"
    },

    td: {
      height: "59px",
      padding:
        "0 15px",
      borderBottom:
        "1px solid #ECE6DF",
      color: "#46433F",
      fontSize: "10px",
      verticalAlign:
        "middle"
    },

    name: {
      color: "#33312F",
      fontSize: "11px",
      fontWeight: "700"
    },

    slug: {
      marginTop: "3px",
      color: "#96918A",
      fontSize: "8px"
    },

    status: {
      display: "inline-flex",
      alignItems:
        "center",
      justifyContent:
        "center",
      height: "24px",
      padding:
        "0 9px",
      borderRadius:
        "100px",
      fontSize: "8px",
      fontWeight: "700"
    },

    actionWrap: {
      display: "flex",
      alignItems: "center",
      gap: "5px"
    },

    iconButton: {
      width: "30px",
      height: "30px",
      border:
        "1px solid #DED7CE",
      borderRadius: "7px",
      background: "#FFFFFF",
      color: "#696560",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      cursor: "pointer"
    },

    deleteButton: {
      color: "#A34A4A"
    },

    empty: {
      minHeight: "250px",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      flexDirection:
        "column",
      textAlign: "center"
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background:
        "rgba(20,28,29,0.45)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      padding: "20px",
      boxSizing:
        "border-box"
    },

    modal: {
      width: "620px",
      maxWidth: "100%",
      maxHeight: "90vh",
      overflowY: "auto",
      background: "#FAF8F5",
      border:
        "1px solid #DED7CF",
      borderRadius: "15px",
      boxShadow:
        "0 20px 55px rgba(0,0,0,0.18)"
    },

    modalHeader: {
      height: "65px",
      padding:
        "0 20px",
      borderBottom:
        "1px solid #E4DDD5",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between"
    },

    modalTitle: {
      margin: 0,
      color: "#2D2B29",
      fontFamily:
        "Georgia, serif",
      fontSize: "19px",
      fontWeight: "600"
    },

    close: {
      width: "32px",
      height: "32px",
      border:
        "1px solid #DED7CE",
      borderRadius: "7px",
      background: "#FFFFFF",
      color: "#696560",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      cursor: "pointer"
    },

    form: {
      padding: "20px"
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "1fr 1fr",
      gap: "15px"
    },

    full: {
      gridColumn:
        "1 / -1"
    },

    field: {
      display: "flex",
      flexDirection:
        "column",
      gap: "7px"
    },

    label: {
      color: "#4D4A46",
      fontSize: "10px",
      fontWeight: "700"
    },

    input: {
      width: "100%",
      height: "42px",
      boxSizing:
        "border-box",
      border:
        "1px solid #D8D1C8",
      borderRadius: "8px",
      padding:
        "0 11px",
      outline: 0,
      background:
        "#FFFFFF",
      color: "#292929",
      fontSize: "11px"
    },

    uploadButton: {
      height: "42px",
      padding:
        "0 14px",
      border:
        "1px solid #D7D0C8",
      borderRadius: "8px",
      background: "#F2EEE9",
      color: "#295C65",
      fontSize: "10px",
      fontWeight: "700",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap"
    },

    textarea: {
      width: "100%",
      minHeight:
        "80px",
      boxSizing:
        "border-box",
      border:
        "1px solid #D8D1C8",
      borderRadius: "8px",
      padding:
        "10px 11px",
      outline: 0,
      resize: "vertical",
      background:
        "#FFFFFF",
      color: "#292929",
      fontSize: "11px",
      fontFamily:
        "Arial, Helvetica, sans-serif"
    },

    select: {
      width: "100%",
      height: "42px",
      boxSizing:
        "border-box",
      border:
        "1px solid #D8D1C8",
      borderRadius: "8px",
      padding:
        "0 10px",
      outline: 0,
      background:
        "#FFFFFF",
      color: "#292929",
      fontSize: "11px"
    },

    toggleRow: {
      minHeight: "48px",
      padding:
        "0 12px",
      border:
        "1px solid #E0D9D1",
      borderRadius: "8px",
      background:
        "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "space-between"
    },

    toggleText: {
      color: "#4A4743",
      fontSize: "10px",
      fontWeight: "600"
    },

    toggle: {
      position: "relative",
      width: "38px",
      height: "21px",
      borderRadius:
        "100px",
      border: 0,
      cursor: "pointer",
      flexShrink: 0
    },

    toggleKnob: {
      position: "absolute",
      top: "3px",
      width: "15px",
      height: "15px",
      borderRadius: "50%",
      background:
        "#FFFFFF",
      transition:
        "left 0.15s ease"
    },

    modalFooter: {
      marginTop: "20px",
      paddingTop: "17px",
      borderTop:
        "1px solid #E5DED5",
      display: "flex",
      justifyContent:
        "flex-end",
      gap: "9px"
    },

    secondaryButton: {
      height: "40px",
      padding:
        "0 14px",
      border:
        "1px solid #D7D0C8",
      borderRadius: "8px",
      background: "#FFFFFF",
      color: "#55514D",
      fontSize: "10px",
      fontWeight: "700",
      cursor: "pointer"
    },

    saveButton: {
      height: "40px",
      padding:
        "0 16px",
      border: 0,
      borderRadius: "8px",
      background: "#295C65",
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      justifyContent:
        "center",
      gap: "7px",
      fontSize: "10px",
      fontWeight: "700",
      cursor: "pointer"
    },

    alert: {
      marginBottom: "15px",
      padding:
        "10px 12px",
      borderRadius: "8px",
      fontSize: "10px"
    }
  };

  const renderToggle =
    (
      value,
      onChange
    ) => (
      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        style={{
          ...styles.toggle,
          background:
            value
              ? "#295C65"
              : "#BDB8B1"
        }}
      >
        <span
          style={{
            ...styles.toggleKnob,
            left:
              value
                ? "20px"
                : "3px"
          }}
        />
      </button>
    );

  return (
    <div style={styles.page}>

      {/* Header */}

      <div
        style={styles.intro}
      >
        <div>
          <h2
            style={
              styles.heading
            }
          >
            Categories
          </h2>

          <p
            style={
              styles.description
            }
          >
            Manage categories and
            subcategories for your
            store.
          </p>
        </div>

        <button
          type="button"
          onClick={
            activeTab ===
            "categories"
              ? openCategoryCreate
              : openSubCategoryCreate
          }
          style={
            styles.primaryButton
          }
        >
          <Plus size={15} />

          {activeTab ===
          "categories"
            ? "Add Category"
            : "Add Subcategory"}
        </button>
      </div>

      {/* Alerts */}

      {error && (
        <div
          style={{
            ...styles.alert,
            background:
              "#FBEDED",
            border:
              "1px solid #EAC8C8",
            color:
              "#A33F3F"
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            ...styles.alert,
            background:
              "#EDF5F1",
            border:
              "1px solid #CFE0D8",
            color:
              "#356D58"
          }}
        >
          {success}
        </div>
      )}

      {/* Main Card */}

      <div
        style={
          styles.tabsCard
        }
      >

        {/* Tabs */}

        <div
          style={styles.tabs}
        >
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "categories"
              )
            }
            style={{
              ...styles.tab,
              ...(activeTab ===
              "categories"
                ? styles.activeTab
                : {})
            }}
          >
            <Tags size={15} />

            Categories

            <span>
              ({categories.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "subcategories"
              )
            }
            style={{
              ...styles.tab,
              ...(activeTab ===
              "subcategories"
                ? styles.activeTab
                : {})
            }}
          >
            <FolderTree
              size={15}
            />

            Subcategories

            <span>
              ({subCategories.length})
            </span>
          </button>
        </div>

        {/* Toolbar */}

        <div
          style={styles.toolbar}
        >
          <div
            style={styles.search}
          >
            <Search
              size={15}
              color="#918B84"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder={
                activeTab ===
                "categories"
                  ? "Search categories..."
                  : "Search subcategories..."
              }
              style={
                styles.searchInput
              }
            />
          </div>

          <span
            style={styles.count}
          >
            {activeTab ===
            "categories"
              ? `${filteredCategories.length} categories`
              : `${filteredSubCategories.length} subcategories`}
          </span>
        </div>

        {/* Loading */}

        {loading ? (
          <div
            style={
              styles.empty
            }
          >
            <Loader2
              size={28}
              color="#295C65"
              style={{
                animation:
                  "category-spin 1s linear infinite"
              }}
            />

            <p
              style={{
                margin:
                  "10px 0 0",
                color:
                  "#85817B",
                fontSize:
                  "10px"
              }}
            >
              Loading...
            </p>
          </div>
        ) : activeTab ===
          "categories" ? (

          /* Categories */

          filteredCategories.length >
          0 ? (
            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Category
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Subcategories
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Home
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Navigation
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map(
                    (category) => {
                      const subCount =
                        subCategories.filter(
                          (sub) =>
                            sub.category?._id ===
                              category._id ||
                            sub.category?.toString() ===
                              category._id
                        ).length;

                      return (
                        <tr
                          key={
                            category._id
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            <div
                              style={
                                styles.name
                              }
                            >
                              {
                                category.name
                              }
                            </div>

                            <div
                              style={
                                styles.slug
                              }
                            >
                              /
                              {
                                category.slug
                              }
                            </div>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {subCount}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {renderToggle(
                              Boolean(
                                category.showOnHome
                              ),
                              async (
                                value
                              ) => {
                                try {
                                  const response =
                                    await fetch(
                                      `${API_URL}/categories/${category._id}`,
                                      {
                                        method:
                                          "PUT",
                                        headers:
                                          {
                                            "Content-Type":
                                              "application/json"
                                          },
                                        credentials:
                                          "include",
                                        body:
                                          JSON.stringify(
                                            {
                                              showOnHome:
                                                value
                                            }
                                          )
                                      }
                                    );

                                  const data =
                                    await response.json();

                                  if (
                                    !response.ok ||
                                    !data.success
                                  ) {
                                    throw new Error(
                                      data.message ||
                                        "Failed to update"
                                    );
                                  }

                                  await loadCategories();

                                  showSuccess(
                                    "Home visibility updated"
                                  );
                                } catch (
                                  error
                                ) {
                                  setError(
                                    error.message
                                  );
                                }
                              }
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {renderToggle(
                              category.showInNavigation !==
                                false,
                              async (
                                value
                              ) => {
                                try {
                                  const response =
                                    await fetch(
                                      `${API_URL}/categories/${category._id}`,
                                      {
                                        method:
                                          "PUT",
                                        headers:
                                          {
                                            "Content-Type":
                                              "application/json"
                                          },
                                        credentials:
                                          "include",
                                        body:
                                          JSON.stringify(
                                            {
                                              showInNavigation:
                                                value
                                            }
                                          )
                                      }
                                    );

                                  const data =
                                    await response.json();

                                  if (
                                    !response.ok ||
                                    !data.success
                                  ) {
                                    throw new Error(
                                      data.message ||
                                        "Failed to update"
                                    );
                                  }

                                  await loadCategories();

                                  showSuccess(
                                    "Navigation visibility updated"
                                  );
                                } catch (
                                  error
                                ) {
                                  setError(
                                    error.message
                                  );
                                }
                              }
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={{
                                ...styles.status,
                                background:
                                  category.status ===
                                  "published"
                                    ? "#EDF5F1"
                                    : "#F1EEEA",
                                color:
                                  category.status ===
                                  "published"
                                    ? "#356D58"
                                    : "#77736D"
                              }}
                            >
                              {
                                category.status
                              }
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <div
                              style={
                                styles.actionWrap
                              }
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  openCategoryEdit(
                                    category
                                  )
                                }
                                style={
                                  styles.iconButton
                                }
                                title="Edit"
                              >
                                <Pencil
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCategory(
                                    category._id
                                  )
                                }
                                style={{
                                  ...styles.iconButton,
                                  ...styles.deleteButton
                                }}
                                title="Delete"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={
                styles.empty
              }
            >
              <Tags
                size={34}
                color="#BE9D6B"
              />

              <h3
                style={{
                  margin:
                    "12px 0 0",
                  color:
                    "#45413D",
                  fontFamily:
                    "Georgia, serif",
                  fontSize:
                    "18px"
                }}
              >
                No Categories
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#88847E",
                  fontSize:
                    "10px"
                }}
              >
                Create your first
                category.
              </p>
            </div>
          )

        ) : (

          /* Subcategories */

          filteredSubCategories.length >
          0 ? (
            <div
              style={
                styles.tableWrapper
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Subcategory
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Parent Category
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Home
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSubCategories.map(
                    (subCategory) => (
                      <tr
                        key={
                          subCategory._id
                        }
                      >
                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.name
                            }
                          >
                            {
                              subCategory.name
                            }
                          </div>

                          <div
                            style={
                              styles.slug
                            }
                          >
                            /
                            {
                              subCategory.slug
                            }
                          </div>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            subCategory
                              .category
                              ?.name ||
                            "—"
                          }
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {renderToggle(
                            Boolean(
                              subCategory.showOnHome
                            ),
                            async (
                              value
                            ) => {
                              try {
                                const response =
                                  await fetch(
                                    `${API_URL}/subcategories/${subCategory._id}`,
                                    {
                                      method:
                                        "PUT",
                                      headers:
                                        {
                                          "Content-Type":
                                            "application/json"
                                        },
                                      credentials:
                                        "include",
                                      body:
                                        JSON.stringify(
                                          {
                                            showOnHome:
                                              value
                                          }
                                        )
                                    }
                                  );

                                const data =
                                  await response.json();

                                if (
                                  !response.ok ||
                                  !data.success
                                ) {
                                  throw new Error(
                                    data.message ||
                                      "Failed to update"
                                  );
                                }

                                await loadSubCategories();

                                showSuccess(
                                  "Home visibility updated"
                                );
                              } catch (
                                error
                              ) {
                                setError(
                                  error.message
                                );
                              }
                            }
                          )}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={{
                              ...styles.status,
                              background:
                                subCategory.status ===
                                "published"
                                  ? "#EDF5F1"
                                  : "#F1EEEA",
                              color:
                                subCategory.status ===
                                "published"
                                  ? "#356D58"
                                  : "#77736D"
                            }}
                          >
                            {
                              subCategory.status
                            }
                          </span>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <div
                            style={
                              styles.actionWrap
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                openSubCategoryEdit(
                                  subCategory
                                )
                              }
                              style={
                                styles.iconButton
                              }
                              title="Edit"
                            >
                              <Pencil
                                size={14}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteSubCategory(
                                  subCategory._id
                                )
                              }
                              style={{
                                ...styles.iconButton,
                                ...styles.deleteButton
                              }}
                              title="Delete"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              style={
                styles.empty
              }
            >
              <FolderTree
                size={34}
                color="#BE9D6B"
              />

              <h3
                style={{
                  margin:
                    "12px 0 0",
                  color:
                    "#45413D",
                  fontFamily:
                    "Georgia, serif",
                  fontSize:
                    "18px"
                }}
              >
                No Subcategories
              </h3>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "#88847E",
                  fontSize:
                    "10px"
                }}
              >
                Create a
                subcategory under
                a category.
              </p>
            </div>
          )
        )}
      </div>

      {/* Category Modal */}

      {categoryFormOpen && (
        <div
          style={
            styles.modalOverlay
          }
        >
          <div
            style={styles.modal}
          >
            <div
              style={
                styles.modalHeader
              }
            >
              <h3
                style={
                  styles.modalTitle
                }
              >
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setCategoryFormOpen(
                    false
                  )
                }
                style={
                  styles.close
                }
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={
                saveCategory
              }
              style={styles.form}
            >
              <div
                style={
                  styles.grid
                }
              >
                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Category Name *
                  </label>

                  <input
                    required
                    value={
                      categoryForm.name
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          name:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="Cotton Fabrics"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Slug
                  </label>

                  <input
                    value={
                      categoryForm.slug
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          slug:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="cotton-fabrics"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Collection / Category Image URL
                  </label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={
                        categoryForm.image?.url || ""
                      }
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          image: {
                            ...categoryForm.image,
                            url: e.target.value,
                          },
                        })
                      }
                      placeholder="https://.../category-image.jpg"
                      style={{
                        ...styles.input,
                        flex: 1
                      }}
                    />
                    <label style={{
                      ...styles.uploadButton,
                      cursor: "pointer"
                    }}>
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) =>
                          handleCategoryImageUpload(
                            event,
                            "image"
                          )
                        }
                      />
                    </label>
                  </div>

                  <small style={{ color: "#7B766F", fontSize: 11, display: "block", marginTop: 6 }}>
                    Recommended size: 1200x900 px for collection cards.
                  </small>
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Collection Hero Image URL
                  </label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={
                        categoryForm.heroImage?.url || ""
                      }
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          heroImage: {
                            ...categoryForm.heroImage,
                            url: e.target.value,
                          },
                        })
                      }
                      placeholder="https://.../collection-hero.jpg"
                      style={{
                        ...styles.input,
                        flex: 1
                      }}
                    />
                    <label style={{
                      ...styles.uploadButton,
                      cursor: "pointer"
                    }}>
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) =>
                          handleCategoryImageUpload(
                            event,
                            "heroImage"
                          )
                        }
                      />
                    </label>
                  </div>

                  <small style={{ color: "#7B766F", fontSize: 11, display: "block", marginTop: 6 }}>
                    Recommended size: 1600x900 px for hero banners.
                  </small>
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Home Page Image URL
                  </label>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={
                        categoryForm.homeImage?.url || ""
                      }
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          homeImage: {
                            ...categoryForm.homeImage,
                            url: e.target.value,
                          },
                        })
                      }
                      placeholder="https://.../home-category.jpg"
                      style={{
                        ...styles.input,
                        flex: 1
                      }}
                    />
                    <label style={{
                      ...styles.uploadButton,
                      cursor: "pointer"
                    }}>
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) =>
                          handleCategoryImageUpload(
                            event,
                            "homeImage"
                          )
                        }
                      />
                    </label>
                  </div>

                  <small style={{ color: "#7B766F", fontSize: 11, display: "block", marginTop: 6 }}>
                    Recommended size: 800x1000 px for homepage cards.
                  </small>
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Image Alt Text
                  </label>

                  <input
                    value={
                      categoryForm.image?.alt || ""
                    }
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        image: {
                          ...categoryForm.image,
                          alt: e.target.value,
                        },
                      })
                    }
                    placeholder="Cotton fabric collection"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Description
                  </label>

                  <textarea
                    value={
                      categoryForm.description
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          description:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="Category description..."
                    style={
                      styles.textarea
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Meta Title
                    (Optional)
                  </label>

                  <input
                    value={
                      categoryForm.metaTitle
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          metaTitle:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="SEO meta title"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Meta Description
                    (Optional)
                  </label>

                  <input
                    value={
                      categoryForm.metaDescription
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          metaDescription:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="SEO meta description"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.toggleRow
                  }
                >
                  <span
                    style={
                      styles.toggleText
                    }
                  >
                    Show on Home
                  </span>

                  {renderToggle(
                    categoryForm.showOnHome,
                    (value) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          showOnHome:
                            value
                        }
                      )
                  )}
                </div>

                <div
                  style={
                    styles.toggleRow
                  }
                >
                  <span
                    style={
                      styles.toggleText
                    }
                  >
                    Show in Navigation
                  </span>

                  {renderToggle(
                    categoryForm.showInNavigation,
                    (value) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          showInNavigation:
                            value
                        }
                      )
                  )}
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Status
                  </label>

                  <select
                    value={
                      categoryForm.status
                    }
                    onChange={(
                      e
                    ) =>
                      setCategoryForm(
                        {
                          ...categoryForm,
                          status:
                            e.target
                              .value
                        }
                      )
                    }
                    style={
                      styles.select
                    }
                  >
                    <option value="published">
                      Published
                    </option>

                    <option value="draft">
                      Draft
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={
                  styles.modalFooter
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setCategoryFormOpen(
                      false
                    )
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={
                    styles.saveButton
                  }
                >
                  {saving ? (
                    <Loader2
                      size={14}
                      style={{
                        animation:
                          "category-spin 1s linear infinite"
                      }}
                    />
                  ) : (
                    <Save
                      size={14}
                    />
                  )}

                  {editingCategory
                    ? "Update Category"
                    : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}

      {subCategoryFormOpen && (
        <div
          style={
            styles.modalOverlay
          }
        >
          <div
            style={styles.modal}
          >
            <div
              style={
                styles.modalHeader
              }
            >
              <h3
                style={
                  styles.modalTitle
                }
              >
                {editingSubCategory
                  ? "Edit Subcategory"
                  : "Add Subcategory"}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setSubCategoryFormOpen(
                    false
                  )
                }
                style={
                  styles.close
                }
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={
                saveSubCategory
              }
              style={styles.form}
            >
              <div
                style={
                  styles.grid
                }
              >
                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Subcategory Name *
                  </label>

                  <input
                    required
                    value={
                      subCategoryForm.name
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          name:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="Cotton Cambric"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Slug
                  </label>

                  <input
                    value={
                      subCategoryForm.slug
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          slug:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="cotton-cambric"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Parent Category *
                  </label>

                  <select
                    required
                    value={
                      subCategoryForm.category
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          category:
                            e.target
                              .value
                        }
                      )
                    }
                    style={
                      styles.select
                    }
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories
                      .filter(
                        (category) =>
                          category.status !==
                          "archived"
                      )
                      .map(
                        (category) => (
                          <option
                            key={
                              category._id
                            }
                            value={
                              category._id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                  </select>
                </div>

                <div
                  style={{
                    ...styles.field,
                    ...styles.full
                  }}
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Description
                  </label>

                  <textarea
                    value={
                      subCategoryForm.description
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          description:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="Subcategory description..."
                    style={
                      styles.textarea
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Meta Title
                    (Optional)
                  </label>

                  <input
                    value={
                      subCategoryForm.metaTitle
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          metaTitle:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="SEO meta title"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Meta Description
                    (Optional)
                  </label>

                  <input
                    value={
                      subCategoryForm.metaDescription
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          metaDescription:
                            e.target
                              .value
                        }
                      )
                    }
                    placeholder="SEO meta description"
                    style={
                      styles.input
                    }
                  />
                </div>

                <div
                  style={
                    styles.toggleRow
                  }
                >
                  <span
                    style={
                      styles.toggleText
                    }
                  >
                    Show on Home
                  </span>

                  {renderToggle(
                    subCategoryForm.showOnHome,
                    (value) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          showOnHome:
                            value
                        }
                      )
                  )}
                </div>

                <div
                  style={
                    styles.field
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Status
                  </label>

                  <select
                    value={
                      subCategoryForm.status
                    }
                    onChange={(
                      e
                    ) =>
                      setSubCategoryForm(
                        {
                          ...subCategoryForm,
                          status:
                            e.target
                              .value
                        }
                      )
                    }
                    style={
                      styles.select
                    }
                  >
                    <option value="published">
                      Published
                    </option>

                    <option value="draft">
                      Draft
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={
                  styles.modalFooter
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setSubCategoryFormOpen(
                      false
                    )
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={
                    styles.saveButton
                  }
                >
                  {saving ? (
                    <Loader2
                      size={14}
                      style={{
                        animation:
                          "category-spin 1s linear infinite"
                      }}
                    />
                  ) : (
                    <Save
                      size={14}
                    />
                  )}

                  {editingSubCategory
                    ? "Update Subcategory"
                    : "Save Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes category-spin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .category-page-grid {
            grid-template-columns:
              1fr !important;
          }
        }

        @media (max-width: 600px) {
          .categories-intro {
            flex-direction:
              column !important;
            align-items:
              flex-start !important;
          }

          .categories-search {
            width:
              100% !important;
          }

          .categories-modal-grid {
            grid-template-columns:
              1fr !important;
          }

          .categories-full {
            grid-column:
              1 !important;
          }
        }
      `}</style>
    </div>
  );
}