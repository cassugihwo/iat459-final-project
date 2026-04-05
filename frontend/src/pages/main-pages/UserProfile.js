import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Footer from "components/footer/UI_Footer";
import ScrollToTop from "components/scroll-to-top/UI_ScrollToTop";
import Toast from "components/toast/UI_Toast";
// eslint-disable-next-line import/no-unresolved
import UIRecipeCard from "components/recipe-card/UI_RecipeCard";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/page-css/UserProfile.css";

const INITIAL_VISIBLE = 4;

function UserProfile() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    async function fetchAll() {
      try {
        const [profileRes, recipesRes, favsRes] = await Promise.all([
          fetch("http://localhost:5001/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://localhost:5001/api/user-recipes", { headers: { "Content-Type": "application/json", Authorization: token } }),
          fetch("http://localhost:5001/api/favourites", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const profileData = await profileRes.json();
        const recipesData = recipesRes.ok ? await recipesRes.json() : [];
        const favsData = favsRes.ok ? await favsRes.json() : [];

        setProfile(profileData);
        setAvatarPreview(profileData.avatar || "");
        setUserRecipes(recipesData);
        setFavourites(favsData);
      } catch (err) {
        setToast("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [token, navigate]);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5001/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: avatarPreview }),
      });
      const data = await res.json();
      setProfile(data);
      setEditMode(false);
      setToast("Profile updated!");
    } catch (err) {
      setToast("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "";

  const visibleRecipes = userRecipes.slice(0, INITIAL_VISIBLE);
  const visibleFavs = favourites.slice(0, INITIAL_VISIBLE);

  return (
    <div className="home-page">
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="navbarHeader"><NavbarHeader /></div>

      <div className="bg">
        <div className="bg-food bg-food-left"><img src={leftDish} alt="" /></div>
        <div className="bg-food bg-food-center"><img src={centerDish} alt="" /></div>
        <div className="bg-food bg-food-right"><img src={rightDish} alt="" /></div>
        <div className="bg-logo"><img src={logo} alt="YumMeal Logo" /></div>
        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar"><Navbar /></div>

        <div className="main-content">
          {loading ? (
            <p className="up-loading">Loading profile...</p>
          ) : profile && (
            <>
              <div className="header-container">
                <div className="header-container-wrapper">
                  <h2>{profile.username}'s Profile</h2>
                </div>
              </div>

              <div className="up-wrapper">

                {/* ── Info card ── */}
                <div className="up-info-card">
                  <div className="up-avatar-col">
                    <div className="up-avatar-circle">
                      {avatarPreview
                        ? <img src={avatarPreview} alt="Avatar" className="up-avatar-img" />
                        : (
                          <svg viewBox="0 0 100 100" fill="none" className="up-avatar-svg">
                            <circle cx="50" cy="50" r="50" fill="#e0d8d0" />
                            <circle cx="50" cy="38" r="18" fill="#b0a89e" />
                            <ellipse cx="50" cy="82" rx="28" ry="20" fill="#b0a89e" />
                          </svg>
                        )
                      }
                    </div>
                    {editMode && (
                      <>
                        <button className="up-upload-btn" onClick={() => avatarInputRef.current.click()}>Upload img</button>
                        <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                      </>
                    )}
                  </div>

                  <div className="up-details">
                    <div className="up-details-top">
                      <div>
                        <p className="up-username">{profile.username}</p>
                        <p className="up-member-since">Member since {memberSince}</p>
                        <p className="up-fullname">{profile.firstName} {profile.lastName}</p>
                      </div>
                      <button className="up-edit-btn" onClick={() => {
                        if (editMode) setAvatarPreview(profile.avatar || "");
                        setEditMode(!editMode);
                      }}>
                        {editMode ? "✕ Cancel" : "✏ Edit Profile"}
                      </button>
                    </div>
                    {editMode && (
                      <div className="up-edit-actions">
                        <button className="up-save-btn" onClick={handleSave} disabled={saving}>
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Stats row ── */}
                <div className="up-stats-row">
                  <div className="up-stat-box">
                    <span className="up-stat-num">{userRecipes.length}</span>
                    <span className="up-stat-label">Recipes Created</span>
                  </div>
                  <div className="up-stat-box">
                    <span className="up-stat-num">{favourites.length}</span>
                    <span className="up-stat-label">Favourites</span>
                  </div>
                  <div className="up-stat-box">
                    <span className="up-stat-num">0</span>
                    <span className="up-stat-label">Meal Plans</span>
                  </div>
                </div>

                {/* ── My Recipes ── */}
                <div className="up-section-card">
                  <div className="up-section-header">
                    <h3 className="up-section-title">My Recipes</h3>
                    <button className="up-section-action" onClick={() => navigate("/saved-recipes")}>View All →</button>
                  </div>
                  {userRecipes.length === 0 ? (
                    <div className="up-empty-state">
                      <p className="up-empty-text">You haven't created any recipes yet.</p>
                      <button className="up-empty-action" onClick={() => navigate("/saved-recipes")}>+ Let's create one</button>
                    </div>
                  ) : (
                    <div className="up-cards-row">
                      {visibleRecipes.map((r) => {
                        const cookMatch = r.instructions?.match(/Cook: (\d+) min/);
                        const mins = cookMatch ? parseInt(cookMatch[1]) : null;
                        const tagMatch = r.instructions?.match(/Tags: ([^\n]+)/);
                        const tags = tagMatch ? tagMatch[1].split(",").map((t) => t.trim()).filter(Boolean) : [];
                        return (
                          <UIRecipeCard
                            key={r._id}
                            title={r.name}
                            image={r.image}
                            dishType={tags[0] || ""}
                            readyInMinutes={mins}
                            hideHeart={true}
                            rating={0}
                            onClick={() => navigate("/saved-recipes")}
                          />
                        );
                      })}
                      <div className="up-add-card" onClick={() => navigate("/saved-recipes")}>
                        <span className="up-add-card-icon">+</span>
                        <span className="up-add-card-label">Add recipe</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Favourites ── */}
                <div className="up-section-card">
                  <div className="up-section-header">
                    <h3 className="up-section-title">Favourite Recipes</h3>
                    <button className="up-section-action" onClick={() => navigate("/saved-recipes")}>View All →</button>
                  </div>
                  {favourites.length === 0 ? (
                    <div className="up-empty-state">
                      <p className="up-empty-text">You haven't saved any favourites yet.</p>
                      <button className="up-empty-action" onClick={() => navigate("/find-recipes")}>+ Let's find some</button>
                    </div>
                  ) : (
                    <div className="up-cards-row">
                      {visibleFavs.map((f) => (
                        <UIRecipeCard
                          key={f._id}
                          title={f.title}
                          image={f.image}
                          cuisineType={f.cuisineType}
                          dishType={f.dishType}
                          readyInMinutes={f.readyInMinutes}
                          hideHeart={true}
                          rating={0}
                          onClick={() => navigate(`/recipe/${f.recipeId}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Meal Plans ── */}
                <div className="up-section-card">
                  <div className="up-section-header">
                    <h3 className="up-section-title">Meal Plans</h3>
                    <button className="up-section-action" onClick={() => navigate("/meal-plan")}>View All →</button>
                  </div>
                  <div className="up-empty-state">
                    <p className="up-empty-text">🗓 No meal plans yet</p>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default UserProfile;
