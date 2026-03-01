// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Onboarding() {
//   const nav = useNavigate();
//   const lookingForOptions = [
//     "Internship",
//     "Graduate Roles",
//     "Entry-Level Roles",
//     "Placement Year",
//   ];

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("");
//   const [lookingFor, setLookingFor] = useState([]);
//   const [interests, setInterests] = useState("");
//   const [cvFile, setCvFile] = useState(null);

//   function toggleLookingFor(option) {
//     setLookingFor((current) =>
//       current.includes(option)
//         ? current.filter((item) => item !== option)
//         : [...current, option],
//     );
//   }

//   function handleContinue() {
//     localStorage.setItem(
//       "mentorme_mentee",
//       JSON.stringify({
//         name: `${firstName} ${lastName}`.trim(),
//         firstName,
//         lastName,
//         email,
//         role,
//         lookingFor,
//         interests,
//         cvName: cvFile?.name || null,
//       }),
//     );
//     nav("/Welcome", { state: { firstName, lastName } });
//   }

//   return (
//     <div style={styles.wrap}>
//       <button style={styles.backBtn} onClick={() => nav(-1)}>
//         ← Back
//       </button>

//       <h2 style={styles.h2}>Create Your Profile</h2>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>First Name</label>
//         <input
//           style={styles.input}
//           value={firstName}
//           onChange={(e) => setFirstName(e.target.value)}
//           placeholder="e.g. Aisha"
//         />
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>Last Name</label>
//         <input
//           style={styles.input}
//           value={lastName}
//           onChange={(e) => setLastName(e.target.value)}
//           placeholder="e.g. Khan"
//         />
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>Email</label>
//         <input
//           style={styles.input}
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="e.g. aisha@email.com"
//         />
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>Target Role</label>
//         <input
//           style={styles.input}
//           list="target-role-options"
//           value={role}
//           onChange={(e) => setRole(e.target.value)}
//           placeholder="Search or select a role"
//         />
//         <datalist id="target-role-options">
//           <option value="Software Engineer" />
//           <option value="Data Analyst" />
//           <option value="Product Manager" />
//           <option value="Consultant" />
//           <option value="Marketing" />
//           <option value="Finance" />
//           <option value="Law" />
//           <option value="Healthcare" />
//           <option value="Teacher / Education" />
//           <option value="Entrepreneur" />
//         </datalist>
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>What are you looking for?</label>
//         <div style={styles.checkboxWrap}>
//           {lookingForOptions.map((option) => (
//             <label key={option} style={styles.checkboxLabel}>
//               <input
//                 type="checkbox"
//                 checked={lookingFor.includes(option)}
//                 onChange={() => toggleLookingFor(option)}
//               />
//               <span>{option}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>Interests and Societies</label>
//         <textarea
//           style={{ ...styles.input, ...styles.textarea }}
//           value={interests}
//           onChange={(e) => setInterests(e.target.value)}
//           placeholder="e.g. Women in Tech Society"
//         />
//       </div>

//       <div style={styles.fieldGroup}>
//         <label style={styles.label}>Upload CV (PDF)</label>
//         <input
//           style={styles.input}
//           type="file"
//           accept=".pdf,.doc,.docx"
//           onChange={(e) => setCvFile(e.target.files?.[0] || null)}
//         />
//       </div>

//       {cvFile && (
//         <div style={styles.card}>
//           <div style={{ fontWeight: 700 }}>Selected:</div>
//           <div style={{ opacity: 0.8 }}>{cvFile.name}</div>
//         </div>
//       )}

//       <button
//         style={{
//           ...styles.btn,
//           opacity: firstName && lastName && email ? 1 : 0.5,
//         }}
//         disabled={!firstName || !lastName || !email}
//         onClick={handleContinue}
//       >
//         Continue to Mentor Matching →
//       </button>
//     </div>
//   );
// }

// const styles = {
//   wrap: {
//     minHeight: "100vh",
//     padding: 18,
//     maxWidth: 420,
//     margin: "0 auto",
//     display: "grid",
//     gap: 12,
//     background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
//     color: "#023047",
//   },
//   logo: {
//     width: "min(220px, 58vw)",
//     height: "auto",
//     margin: "6px auto 2px",
//     background: "#e4f2e8",
//     borderRadius: 16,
//     padding: 8,
//   },
//   h2: { marginTop: 8, marginBottom: 6, color: "#023047" },
//   fieldGroup: {
//     display: "grid",
//     gap: 2,
//     marginBottom: 6,
//   },
//   label: { fontSize: 13, fontWeight: 700, opacity: 0.85, color: "#244e62" },
//   input: {
//     padding: 12,
//     borderRadius: 12,
//     border: "1px solid #d3e7da",
//     fontSize: 15,
//     color: "#023047",
//     background: "#ffffff",
//   },
//   checkboxWrap: {
//     display: "grid",
//     gap: 8,
//     padding: "8px 10px",
//     border: "1px solid #d3e7da",
//     borderRadius: 12,
//     background: "#ffffff",
//   },
//   checkboxLabel: {
//     display: "flex",
//     alignItems: "center",
//     gap: 8,
//     fontSize: 14,
//     color: "#244e62",
//   },
//   textarea: {
//     minHeight: 92,
//     resize: "vertical",
//   },
//   card: {
//     padding: 12,
//     borderRadius: 12,
//     border: "1px solid #d3e7da",
//     background: "#ffffff",
//   },
//   btn: {
//     marginTop: 18,
//     padding: 14,
//     borderRadius: 14,
//     border: "1px solid #7fb491",
//     background: "#94c3a3",
//     color: "#023047",
//     fontWeight: 700,
//   },

//   backBtn: {
//     justifySelf: "start",
//     border: "none",
//     borderTop: "1px solid #d3e7da",
//     color: "#ffffff",
//     background: "#1f5f3a",
//     padding: "8px 14px",
//     marginBottom: 2,
//     borderRadius: 12,
//     fontWeight: 700,
//     cursor: "pointer",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
//   },
// };

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export default function Onboarding() {
  const nav = useNavigate();

  const lookingForOptions = [
    "Internship",
    "Graduate Roles",
    "Entry-Level Roles",
    "Placement Year",
  ];

  const [userType, setUserType] = useState("mentee"); // "mentee" | "mentor"

  // Common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Mentee: target role. Mentor: their title.
  const [role, setRole] = useState("");

  // Mentee fields
  const [lookingFor, setLookingFor] = useState([]);
  const [interests, setInterests] = useState("");
  const [cvFile, setCvFile] = useState(null);

  // Mentor-only fields
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [mentorPhotoData, setMentorPhotoData] = useState(""); // base64 data url

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  function toggleLookingFor(option) {
    setLookingFor((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  function handleContinue() {
    const compactPhotoData =
      mentorPhotoData && mentorPhotoData.length <= 250000 ? mentorPhotoData : "";

    // unified user record (useful later for role-based routing)
    const user = {
      userType,
      firstName,
      lastName,
      email,
      role,
      industry,
      company,
      bio,
      lookingFor,
      interests,
      cvName: cvFile?.name || null,
      mentorPhotoData: null,
    };

    safeSetItem("mentorme_user", JSON.stringify(user));

    // ✅ mentee flow (keep your existing storage so nothing breaks)
    if (userType === "mentee") {
      safeSetItem(
        "mentorme_mentee",
        JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          firstName,
          lastName,
          email,
          role,
          lookingFor,
          interests,
          cvName: cvFile?.name || null,
        }),
      );

      nav("/welcome", { state: { firstName, lastName } });
      return;
    }

    // ✅ mentor flow
    // IMPORTANT: one id used for BOTH mentor profile + swipe deck
    const newId = Date.now();

    const mentor = {
      id: newId, // ✅ REQUIRED so MentorDashboard can match mentorId
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      title: role,
      industry,
      company,
      bio,
      img: compactPhotoData,
    };

    safeSetItem("mentorme_mentor", JSON.stringify(mentor));

    // ✅ push mentor into swipe pool (so mentees see real mentors)
    const existing = JSON.parse(
      localStorage.getItem("mentorme_mentors") || "[]",
    );

    const newMentor = {
      id: newId, // ✅ SAME id
      name: mentor.name,
      title: mentor.title,
      industry: mentor.industry,
      company: mentor.company,
      match: 90, // demo default (you can calculate later)
      bio: mentor.bio,
      img: mentor.img,
    };

    safeSetItem(
      "mentorme_mentors",
      JSON.stringify([newMentor, ...existing]),
    );

    nav("/mentor");
  }

  const canContinueCommon = firstName && lastName && email;

  const canContinueMentor =
    canContinueCommon && role && industry && company && bio && mentorPhotoData;

  const canContinueMentee = canContinueCommon;

  const canContinue =
    userType === "mentor" ? canContinueMentor : canContinueMentee;

  return (
    <div style={styles.wrap}>
      <button style={styles.backBtn} onClick={() => nav(-1)}>
        ← Back
      </button>

      <h2 style={styles.h2}>Create Your Profile</h2>

      {/* User type selector */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>I am a...</label>
        <div style={styles.roleWrap}>
          <button
            type="button"
            onClick={() => setUserType("mentee")}
            style={{
              ...styles.roleBtn,
              ...(userType === "mentee" ? styles.roleActive : {}),
            }}
          >
            🎓 Mentee
          </button>

          <button
            type="button"
            onClick={() => setUserType("mentor")}
            style={{
              ...styles.roleBtn,
              ...(userType === "mentor" ? styles.roleActive : {}),
            }}
          >
            🧑‍🏫 Mentor
          </button>
        </div>
      </div>

      {/* Common fields */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>First Name</label>
        <input
          style={styles.input}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="e.g. Aisha"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Last Name</label>
        <input
          style={styles.input}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="e.g. Khan"
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Email</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. aisha@email.com"
        />
      </div>

      {/* Role/Title */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>
          {userType === "mentor" ? "Your Title" : "Target Role"}
        </label>
        <input
          style={styles.input}
          list="target-role-options"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder={
            userType === "mentor"
              ? "e.g. Software Engineer"
              : "Search or select a role"
          }
        />
        <datalist id="target-role-options">
          <option value="Software Engineer" />
          <option value="Data Analyst" />
          <option value="Product Manager" />
          <option value="Consultant" />
          <option value="Marketing" />
          <option value="Finance" />
          <option value="Law" />
          <option value="Healthcare" />
          <option value="Teacher / Education" />
          <option value="Entrepreneur" />
        </datalist>
      </div>

      {/* Mentor-only fields */}
      {userType === "mentor" && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Industry</label>
            <input
              style={styles.input}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Big Tech, Finance, Consulting"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Company</label>
            <input
              style={styles.input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Amazon"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Bio</label>
            <textarea
              style={{ ...styles.input, ...styles.textarea }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="1–2 lines about what you can help with."
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Upload Profile Photo</label>
            <input
              style={styles.input}
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                setMentorPhotoData(dataUrl);
              }}
            />
          </div>

          {mentorPhotoData && (
            <div style={styles.photoCard}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Preview</div>
              <img
                src={mentorPhotoData}
                alt="Mentor preview"
                style={styles.photoPreview}
              />
            </div>
          )}
        </>
      )}

      {/* Mentee-only fields */}
      {userType === "mentee" && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>What are you looking for?</label>
            <div style={styles.checkboxWrap}>
              {lookingForOptions.map((option) => (
                <label key={option} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={lookingFor.includes(option)}
                    onChange={() => toggleLookingFor(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Interests and Societies</label>
            <textarea
              style={{ ...styles.input, ...styles.textarea }}
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Women in Tech Society"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Upload CV (PDF)</label>
            <input
              style={styles.input}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            />
          </div>

          {cvFile && (
            <div style={styles.card}>
              <div style={{ fontWeight: 700 }}>Selected:</div>
              <div style={{ opacity: 0.8 }}>{cvFile.name}</div>
            </div>
          )}
        </>
      )}

      <button
        style={{ ...styles.btn, opacity: canContinue ? 1 : 0.5 }}
        disabled={!canContinue}
        onClick={handleContinue}
      >
        {userType === "mentor"
          ? "Continue to Mentor Dashboard →"
          : "Continue to Mentor Matching →"}
      </button>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    padding: 18,
    maxWidth: 420,
    margin: "0 auto",
    display: "grid",
    gap: 12,
    background: "linear-gradient(165deg, #f5fbf7 0%, #e4f2e8 100%)",
    color: "#023047",
  },

  h2: { marginTop: 8, marginBottom: 6, color: "#023047" },

  fieldGroup: {
    display: "grid",
    gap: 6,
    marginBottom: 6,
  },

  label: { fontSize: 13, fontWeight: 700, opacity: 0.85, color: "#244e62" },

  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    fontSize: 15,
    color: "#023047",
    background: "#ffffff",
  },

  textarea: {
    minHeight: 92,
    resize: "vertical",
  },

  checkboxWrap: {
    display: "grid",
    gap: 8,
    padding: "8px 10px",
    border: "1px solid #d3e7da",
    borderRadius: 12,
    background: "#ffffff",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#244e62",
  },

  card: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    background: "#ffffff",
  },

  photoCard: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d3e7da",
    background: "#ffffff",
  },

  photoPreview: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 12,
    border: "1px solid #d3e7da",
  },

  btn: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #7fb491",
    background: "#94c3a3",
    color: "#023047",
    fontWeight: 800,
  },

  backBtn: {
    justifySelf: "start",
    border: "none",
    borderTop: "1px solid #d3e7da",
    color: "#ffffff",
    background: "#1f5f3a",
    padding: "8px 14px",
    marginBottom: 2,
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },

  roleWrap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  roleBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid #d3e7da",
    background: "#ffffff",
    fontWeight: 900,
    color: "#023047",
  },

  roleActive: {
    border: "1px solid #1a4f31",
    background: "#94c3a3",
  },
};
