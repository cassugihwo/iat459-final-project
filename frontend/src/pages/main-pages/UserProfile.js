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

function UserProfile() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const recipesRef = useRef(null);
  const favouritesRef = useRef(null);
  const mealPlansRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    async function fetchAll() {
      try {
        const [profileRes, recipesRes, favsRes] = await Promise.all([
          fetch("http://localhost:5001/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5001/api/user-recipes2", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5001/api/favourites", {
            headers: { Authorization: `Bearer ${token}` },
          }),
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar: avatarPreview,
          username: editUsername.trim() || profile.username,
          firstName: editFirstName.trim() || profile.firstName,
          lastName: editLastName.trim() || profile.lastName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast(data.message || "Failed to save profile.");
        return;
      }
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
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="home-page">
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left">
          <img src={leftDish} alt="" />
        </div>
        <div className="bg-food bg-food-center">
          <img src={centerDish} alt="" />
        </div>
        <div className="bg-food bg-food-right">
          <img src={rightDish} alt="" />
        </div>
        <div className="bg-logo">
          <img src={logo} alt="YumMeal Logo" />
        </div>
        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="main-content">
          {loading ? (
            <p className="up-loading">Loading profile...</p>
          ) : (
            profile && (
              <>
                <div className="header-container">
                  <div className="header-container-wrapper">
                    <h2>{profile.username}'s Profile</h2>
                  </div>
                </div>

                <div className="up-wrapper">
                  {/* Info card */}
                  <div className="up-info-card">
                    <div className="up-avatar-col">
                      <div className="up-avatar-circle">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="up-avatar-img"
                          />
                        ) : (
                          <span className="up-avatar-initials">
                            {profile?.username?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {editMode && (
                        <>
                          <button
                            className="up-upload-btn"
                            onClick={() => avatarInputRef.current.click()}
                          >
                            Upload Photo
                          </button>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleAvatarChange}
                          />
                        </>
                      )}
                    </div>

                    <div className="up-details">
                      <div className="up-details-top">
                        <div className="up-details-info">
                          {editMode ? (
                            <>
                              <input
                                className="up-edit-input up-edit-username"
                                value={editUsername}
                                onChange={(e) =>
                                  setEditUsername(e.target.value)
                                }
                                placeholder="Username"
                              />
                              <div className="up-edit-name-row">
                                <input
                                  className="up-edit-input"
                                  value={editFirstName}
                                  onChange={(e) =>
                                    setEditFirstName(e.target.value)
                                  }
                                  placeholder="First name"
                                />
                                <input
                                  className="up-edit-input"
                                  value={editLastName}
                                  onChange={(e) =>
                                    setEditLastName(e.target.value)
                                  }
                                  placeholder="Last name"
                                />
                              </div>
                              <p className="up-member-since">
                                Member since {memberSince}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="up-username">{profile.username}</p>
                              <p className="up-fullname">
                                {profile.firstName} {profile.lastName}
                              </p>
                              <p className="up-member-since">
                                Member since {memberSince}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="up-details-actions">
                          <button
                            className="up-edit-btn"
                            onClick={() => {
                              if (editMode) {
                                setAvatarPreview(profile.avatar || "");
                              } else {
                                setEditUsername(profile.username || "");
                                setEditFirstName(profile.firstName || "");
                                setEditLastName(profile.lastName || "");
                              }
                              setEditMode(!editMode);
                            }}
                          >
                            {editMode ? "x Cancel" : "Edit Profile"}
                          </button>
                          {editMode && (
                            <button
                              className="up-save-btn"
                              onClick={handleSave}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save Changes"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="up-stats-row">
                    <div
                      className="up-stat-box"
                      onClick={() =>
                        recipesRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                    >
                      <span className="up-stat-num">{userRecipes.length}</span>
                      <span className="up-stat-label">Recipes Created</span>
                    </div>
                    <div
                      className="up-stat-box"
                      onClick={() =>
                        favouritesRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                    >
                      <span className="up-stat-num">{favourites.length}</span>
                      <span className="up-stat-label">Favourites</span>
                    </div>
                    <div
                      className="up-stat-box"
                      onClick={() =>
                        mealPlansRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        })
                      }
                    >
                      <span className="up-stat-num">0</span>
                      <span className="up-stat-label">Meal Plans</span>
                    </div>
                  </div>

                  {/* My Recipes */}
                  <div className="up-section-card" ref={recipesRef}>
                    <div className="up-section-header">
                      <h3 className="up-section-title">My Recipes</h3>
                      <button
                        className="up-section-action"
                        onClick={() => navigate("/saved-recipes")}
                      >
                        View All →
                      </button>
                    </div>
                    {userRecipes.length === 0 ? (
                      <div className="up-empty-state">
                        <p className="up-empty-text">
                          You haven't created any recipes yet.
                        </p>
                        <button
                          className="up-empty-action"
                          onClick={() => navigate("/saved-recipes")}
                        >
                          + Let's create one
                        </button>
                      </div>
                    ) : (
                      <div className="up-carousel-wrapper">
                        <div className="up-cards-row">
                          {userRecipes.map((r) => {
                            const cookMatch =
                              r.instructions?.match(/Cook: (\d+) min/);
                            const mins = cookMatch
                              ? parseInt(cookMatch[1])
                              : null;
                            const tagMatch =
                              r.instructions?.match(/Tags: ([^\n]+)/);
                            const tags = tagMatch
                              ? tagMatch[1]
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                              : [];
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
                          <div
                            className="up-add-card"
                            onClick={() => navigate("/saved-recipes")}
                          >
                            <span className="up-add-card-icon">+</span>
                            <span className="up-add-card-label">
                              Add recipe
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Favourites */}
                  <div className="up-section-card" ref={favouritesRef}>
                    <div className="up-section-header">
                      <h3 className="up-section-title">Favourite Recipes</h3>
                      <button
                        className="up-section-action"
                        onClick={() => navigate("/pantry")}
                      >
                        View All →
                      </button>
                    </div>
                    {favourites.length === 0 ? (
                      <div className="up-empty-state">
                        <p className="up-empty-text">
                          You haven't saved any favourites yet.
                        </p>
                        <button
                          className="up-empty-action"
                          onClick={() => navigate("/find-recipes")}
                        >
                          Let's find some
                        </button>
                      </div>
                    ) : (
                      <div className="up-carousel-wrapper">
                        <div className="up-cards-row">
                          {favourites.map((f) => (
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
                      </div>
                    )}
                  </div>

                  {/* Meal Plans */}
                  <div className="up-section-card" ref={mealPlansRef}>
                    <div className="up-section-header">
                      <h3 className="up-section-title">Meal Plans</h3>
                      <button
                        className="up-section-action"
                        onClick={() => navigate("/meal-plan")}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="up-empty-state">
                      <p className="up-empty-text">🗓 No meal plans yet</p>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>

        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default UserProfile;
