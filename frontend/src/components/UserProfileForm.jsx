import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const professions = ["Student", "Developer", "Entrepreneur"];
const plans = ["Basic", "Pro", "Enterprise"];
const genders = ["Male", "Female", "Other"];

const passwordStrength = pwd => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  return score;
};

const today = new Date().toISOString().split("T")[0];

const UserProfileForm = ({ user, onSuccess }) => {
  const [form, setForm] = useState({
    profilePhoto: null,
    profilePhotoUrl: "",
    username: "",
    usernameAvailable: null,
    usernameChecking: false,
    currentPassword: "",
    newPassword: "",
    profession: "",
    companyName: "",
    address1: "",
    country: "",
    state: "",
    city: "",
    plan: "Basic",
    newsletter: true,
    dob: "",
    gender: "",
    genderOther: ""
  });
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const fileInputRef = useRef();
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [step, setStep] = useState(1);

  // API data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/user/countries`);
        const data = res.data;
        if (!Array.isArray(data) || !data.length) {
          setCountries([]);
          toast.error('No country data found.');
        } else {
          setCountries(data);
        }
      } catch (err) {
        setCountries([]);
        toast.error('Could not load countries');
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [API_BASE_URL]);

  // Update states when country changes
  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setCities([]);
      return;
    }
    const countryObj = countries.find(c => c.name === form.country);
    setStates(countryObj ? countryObj.states : []);
    setCities([]);
  }, [form.country, countries]);

  // Update cities when state changes
  useEffect(() => {
    if (!form.state) {
      setCities([]);
      return;
    }
    const stateObj = states.find(s => s.name === form.state);
    setCities(stateObj ? stateObj.cities.map(c => c.name) : []);
  }, [form.state, states]);

  // Username check API
  useEffect(() => {
    if (user && form.username === user.username) {
      setForm(prev => ({ ...prev, usernameAvailable: null, usernameChecking: false }));
      return;
    }
    if (!form.username) {
      setForm(prev => ({ ...prev, usernameAvailable: null, usernameChecking: false }));
      return;
    }
    if (form.username.length >= 4 && form.username.length <= 20 && !/\s/.test(form.username)) {
      setIsLoadingUsername(true);
      setForm(prev => ({ ...prev, usernameAvailable: null, usernameChecking: true }));
      let cancelToken;
      const check = async () => {
        try {
          cancelToken = axios.CancelToken.source();
          const res = await axios.get(`${API_BASE_URL}/api/users/user/check-username`, {
            params: { username: form.username },
            cancelToken: cancelToken.token
          });
          setForm(prev => ({ ...prev, usernameAvailable: res.data.available, usernameChecking: false }));
        } catch (err) {
          if (!axios.isCancel(err)) {
            setForm(prev => ({ ...prev, usernameAvailable: null, usernameChecking: false }));
          }
        } finally {
          setIsLoadingUsername(false);
        }
      };
      check();
      return () => cancelToken && cancelToken.cancel();
    } else {
      setForm(prev => ({ ...prev, usernameAvailable: null, usernameChecking: false }));
    }
  }, [form.username, API_BASE_URL, user]);

  useEffect(() => {
    if (user) {
      let dob = "";
      if (user.dob) {
        if (typeof user.dob === 'string' && user.dob.length >= 10) {
          const d = new Date(user.dob);
          if (!isNaN(d)) {
            dob = d.toISOString().split('T')[0];
          } else {
            dob = user.dob.slice(0, 10);
          }
        } else if (user.dob instanceof Date) {
          dob = user.dob.toISOString().split('T')[0];
        }
      }
      setForm({
        profilePhoto: null,
        profilePhotoUrl: user.profilePhoto ? (user.profilePhoto.startsWith('/') ? `${API_BASE_URL}${user.profilePhoto}` : user.profilePhoto) : "",
        username: user.username || "",
        usernameAvailable: null,
        usernameChecking: false,
        currentPassword: "",
        newPassword: "",
        profession: user.profession || "",
        companyName: user.companyName || "",
        address1: user.address1 || "",
        country: user.country || "",
        state: user.state || "",
        city: user.city || "",
        plan: user.plan || "Basic",
        newsletter: typeof user.newsletter === 'boolean' ? user.newsletter : true,
        dob,
        gender: user.gender || "",
        genderOther: user.genderOther || ""
      });
    } else {
      setForm({
        profilePhoto: null,
        profilePhotoUrl: "",
        username: "",
        usernameAvailable: null,
        usernameChecking: false,
        currentPassword: "",
        newPassword: "",
        profession: "",
        companyName: "",
        address1: "",
        country: "",
        state: "",
        city: "",
        plan: "Basic",
        newsletter: true,
        dob: "",
        gender: "",
        genderOther: ""
      });
    }
  }, [user]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm(prev => {
      const updated = { ...prev, [name]: val };
      if (name === "profession" && value !== "Entrepreneur") updated.companyName = "";
      if (name === "gender" && value !== "Other") updated.genderOther = "";
      if (name === "country") {
        updated.state = "";
        updated.city = "";
      }
      if (name === "state") updated.city = "";
      return updated;
    });
    if (name === "newPassword") setPasswordScore(passwordStrength(value));
  };

  // File upload
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profilePhoto: "Only JPG/PNG, max 2MB" }));
      setForm(prev => ({ ...prev, profilePhoto: null, profilePhotoUrl: "" }));
      return;
    }
    setErrors(prev => ({ ...prev, profilePhoto: null }));
    const reader = new FileReader();
    reader.onload = ev => setForm(prev => ({
      ...prev,
      profilePhoto: file,
      profilePhotoUrl: ev.target.result
    }));
    reader.readAsDataURL(file);
  };

  // Validation for each step
  const validateStep = (stepNum = step) => {
    let e = {};
    if (stepNum === 1) {
      if (!form.profilePhoto && !form.profilePhotoUrl) e.profilePhoto = "Required";
      if (!form.username || form.username.length < 4 || form.username.length > 20 || /\s/.test(form.username))
        e.username = "4-20 chars, no spaces";
      if (form.usernameAvailable === false) e.username = "Username taken";
      if(!form.newPassword&&!user){
        e.newPassword = "Required for new user";
      }
      if (form.newPassword) {
        if (user && !form.currentPassword) e.currentPassword = "Required for password change";
        if (form.newPassword.length < 8 || !/[!@#$%^&*]/.test(form.newPassword) || !/\d/.test(form.newPassword))
          e.newPassword = "8+ chars, 1 special char, 1 number";
      }
      if (!form.dob) e.dob = "Required";
      if (form.dob && form.dob > today) e.dob = "No future dates";
      if (!form.gender) e.gender = "Required";
      if (form.gender === "Other" && !form.genderOther) e.genderOther = "Required";
    } else if (stepNum === 2) {
      if (!form.profession) e.profession = "Required";
      if (form.profession === "Entrepreneur" && !form.companyName) e.companyName = "Required";
      if (!form.address1) e.address1 = "Required";
    } else if (stepNum === 3) {
      if (!form.country) e.country = "Required";
      if (!form.state) e.state = "Required";
      if (!form.city) e.city = "Required";
    }
    return e;
  };

  // Submit
  const handleStepNext = e => {
    e.preventDefault();
    const eObj = validateStep(step);
    setErrors(eObj);
    if (Object.keys(eObj).length === 0) setStep(s => s + 1);
  };
  const handleStepBack = e => {
    e.preventDefault();
    setErrors({});
    setStep(s => s - 1);
  };
  const handleSubmit = e => {
    e.preventDefault();
    const eObj = validateStep(3);
    setErrors(eObj);
    if (Object.keys(eObj).length === 0) setShowSummary(true);
  };

  // Final submit (API)
  const handleFinalSubmit = async () => {
    setShowSummary(false);
    setSubmitStatus(null);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'profilePhoto') {
        if (value) formData.append('profilePhoto', value);
      } else {
        formData.append(key, value);
      }
    });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/user/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      if (res.status === 200 && data.success) {
        if(data.new) {
          setSubmitStatus({ success: true, message: 'Profile created successfully!' });
          toast.success('Profile created successfully!');
        }else{
          setSubmitStatus({ success: true, message: 'Profile updated successfully!' });
          toast.success('Profile updated successfully!');
        }
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setSubmitStatus({ success: false, message: data.error || 'Update failed.' });
        toast.error(data.error || 'Update failed.');
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: err.response?.data?.error ||'Network error.',err:err });
      toast.error('Network error.');
    }
  };

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <form className="max-w-2xl mx-auto bg-white p-4 rounded shadow flex flex-col gap-4">
        {step === 1 && (
          <div className="border-b pb-4">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-2 row-span-2 flex flex-col items-center md:items-start">
                <label className="font-semibold text-xs mb-1">Profile Photo *</label>
                {form.profilePhotoUrl && (
                  <img src={form.profilePhotoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-blue-300 mb-2 shadow" />
                )}
                {form.profilePhoto && (
                  <div className="w-full flex justify-center mb-1">
                    <span className="text-xs mt-1 break-all text-center">{form.profilePhoto.name}</span>
                  </div>
                )}
                <label className="relative cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-200 w-full text-center">
                  Choose File
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFile}
                    ref={fileInputRef}
                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
                {errors.profilePhoto && <span className="text-red-500 text-xs">{errors.profilePhoto}</span>}
              </div>
              <div className="md:col-span-10 flex flex-col">
                <label className="font-semibold">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  autoComplete="off"
                />
                <div className="flex items-center gap-2">
                  {isLoadingUsername && <span className="text-xs text-gray-500">Checking...</span>}
                  {form.usernameAvailable === false && <span className="text-red-500 text-xs">Username taken</span>}
                  {form.usernameAvailable && <span className="text-green-600 text-xs">Available</span>}
                  {errors.username && <span className="text-red-500 text-xs">{errors.username}</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="flex flex-col">
                    <label className="font-semibold">Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      value={form.dob}
                      max={today}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                    />
                    {errors.dob && <span className="text-red-500 text-xs">{errors.dob}</span>}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">Gender *</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                    >
                      <option value="">Select</option>
                      {genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {form.gender === "Other" && (
                      <input
                        type="text"
                        name="genderOther"
                        value={form.genderOther}
                        onChange={handleChange}
                        placeholder="Please specify"
                        className="input input-bordered w-full mt-1"
                      />
                    )}
                    {errors.gender && <span className="text-red-500 text-xs">{errors.gender}</span>}
                    {form.gender === "Other" && errors.genderOther && (
                      <span className="text-red-500 text-xs">{errors.genderOther}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="flex flex-col">
                    <label className="font-semibold">Current Password {form.newPassword && "*"}</label>
                    <div className="relative w-full">
                      <input
                        type={showCurrentPwd ? "text" : "password"}
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        className="input input-bordered w-full pr-10"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={showCurrentPwd ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none bg-white"
                        style={{padding: 0, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        onClick={() => setShowCurrentPwd(v => !v)}
                      >
                        {showCurrentPwd ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="h-5 w-5"><path d="M572.52 241.4C518.7 135.5 410.7 64 288 64S57.3 135.5 3.48 241.4a48.35 48.35 0 0 0 0 29.2C57.3 376.5 165.3 448 288 448s230.7-71.5 284.52-177.4a48.35 48.35 0 0 0 0-29.2zM288 400c-97.2 0-189.8-57.6-238.8-144C98.2 169.6 190.8 112 288 112s189.8 57.6 238.8 144C477.8 342.4 385.2 400 288 400zm0-272a128 128 0 1 0 128 128A128 128 0 0 0 288 128zm0 208a80 80 0 1 1 80-80 80 80 0 0 1-80 80z"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="h-5 w-5"><path d="M320 400c-36.2 0-70.1-11.7-98.1-31.4l-39.6 30.7C225.6 426.7 271.1 448 320 448c122.7 0 230.7-71.5 284.5-177.4a47.9 47.9 0 0 0 0-29.2c-21.6-42.2-54.1-78.6-93.2-105.2l-39.6 30.7C390.1 388.3 356.2 400 320 400zm317.7 51.7l-588-456A16 16 0 0 0 12.3 60.3l588 456a16 16 0 0 0 22.6-22.6zM320 112c-97.2 0-189.8 57.6-238.8 144 21.6 42.2 54.1 78.6 93.2 105.2l39.6-30.7C249.9 123.7 283.8 112 320 112zm0 272a128 128 0 1 1 128-128 128 128 0 0 1-128 128z"/></svg>
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && <span className="text-red-500 text-xs">{errors.currentPassword}</span>}
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold">New Password</label>
                    <div className="relative w-full">
                      <input
                        type={showNewPwd ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        className="input input-bordered w-full pr-10"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={showNewPwd ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none bg-white"
                        style={{padding: 0, height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                        onClick={() => setShowNewPwd(v => !v)}
                      >
                        {showNewPwd ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className="h-5 w-5"><path d="M572.52 241.4C518.7 135.5 410.7 64 288 64S57.3 135.5 3.48 241.4a48.35 48.35 0 0 0 0 29.2C57.3 376.5 165.3 448 288 448s230.7-71.5 284.52-177.4a48.35 48.35 0 0 0 0-29.2zM288 400c-97.2 0-189.8-57.6-238.8-144C98.2 169.6 190.8 112 288 112s189.8 57.6 238.8 144C477.8 342.4 385.2 400 288 400zm0-272a128 128 0 1 0 128 128A128 128 0 0 0 288 128zm0 208a80 80 0 1 1 80-80 80 80 0 0 1-80 80z"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="h-5 w-5"><path d="M320 400c-36.2 0-70.1-11.7-98.1-31.4l-39.6 30.7C225.6 426.7 271.1 448 320 448c122.7 0 230.7-71.5 284.5-177.4a47.9 47.9 0 0 0 0-29.2c-21.6-42.2-54.1-78.6-93.2-105.2l-39.6 30.7C390.1 388.3 356.2 400 320 400zm317.7 51.7l-588-456A16 16 0 0 0 12.3 60.3l588 456a16 16 0 0 0 22.6-22.6zM320 112c-97.2 0-189.8 57.6-238.8 144 21.6 42.2 54.1 78.6 93.2 105.2l39.6-30.7C249.9 123.7 283.8 112 320 112zm0 272a128 128 0 1 1 128-128 128 128 0 0 1-128 128z"/></svg>
                        )}
                      </button>
                    </div>
                    {form.newPassword && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-2 bg-gray-200 rounded">
                          <div
                            className={`h-2 rounded ${passwordScore === 1 ? "bg-red-400 w-1/3" : passwordScore === 2 ? "bg-yellow-400 w-2/3" : passwordScore === 3 ? "bg-green-500 w-full" : ""}`}
                          />
                        </div>
                        <span className="text-xs">
                          {passwordScore === 1 && "Weak"}
                          {passwordScore === 2 && "Medium"}
                          {passwordScore === 3 && "Strong"}
                        </span>
                      </div>
                    )}
                    {errors.newPassword && <span className="text-red-500 text-xs">{errors.newPassword}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="border-b pb-4">
            {/* Professional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="font-semibold">Profession *</label>
                <select
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                >
                  <option value="">Select</option>
                  {professions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.profession && <span className="text-red-500 text-xs">{errors.profession}</span>}
              </div>
              {form.profession === "Entrepreneur" && (
                <div className="flex flex-col">
                  <label className="font-semibold">Company Name *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                  {errors.companyName && <span className="text-red-500 text-xs">{errors.companyName}</span>}
                </div>
              )}
            </div>
            <div className="flex flex-col mt-3">
              <label className="font-semibold">Address Line 1 *</label>
              <input
                type="text"
                name="address1"
                value={form.address1}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
              {errors.address1 && <span className="text-red-500 text-xs">{errors.address1}</span>}
            </div>
          </div>
        )}
        {step === 3 && (
          <>
            <div className="border-b pb-4">
              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="font-semibold">Country *</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    disabled={isLoadingCountries}
                  >
                    <option value="">{isLoadingCountries ? "Loading..." : "Select"}</option>
                    {countries && countries.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {errors.country && <span className="text-red-500 text-xs">{errors.country}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">State *</label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    disabled={!form.country}
                  >
                    <option value="">Select</option>
                    {states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                  </select>
                  {errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">City *</label>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    disabled={!form.state}
                  >
                    <option value="">Select</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {/* Subscription & Newsletter */}
              <div className="flex flex-col">
                <label className="font-semibold">Subscription Plan *</label>
                <div className="flex gap-4">
                  {plans.map(p => (
                    <label key={p} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="plan"
                        value={p}
                        checked={form.plan === p}
                        onChange={handleChange}
                        className="radio"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={form.newsletter}
                  onChange={handleChange}
                  className="checkbox"
                />
                <label className="font-semibold">Subscribe to newsletter</label>
              </div>
            </div>
          </>
        )}
        <div className="flex gap-2 mt-4">
          {step > 1 && (
            <button type="button" className="btn bg-gray-200 text-gray-700" onClick={handleStepBack}>
              Back
            </button>
          )}
          {step < 3 && (
            <button type="button" className="btn btn-primary" onClick={handleStepNext}>
              Next
            </button>
          )}
          {step === 3 && (
            <button type="button" className="btn btn-primary w-full" onClick={handleSubmit}>
              Review & Submit
            </button>
          )}
        </div>
        {showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col items-center gap-4">
              <h2 className="text-xl font-semibold mb-2 text-center">Review Your Details</h2>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex flex-col items-center w-full">
                  <span className="font-medium text-sm mb-1">Profile Photo:</span>
                  {form.profilePhotoUrl && (
                    <img src={form.profilePhotoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-blue-300 shadow mb-2" />
                  )}
                </div>
                <div className="w-full border-t-2 border-gray-200 my-2"></div>
                <div className="flex flex-col gap-2 w-full text-sm items-center">
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Username:</span> <span>{form.username}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">DOB:</span> <span>{form.dob}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Gender:</span> <span>{form.gender === "Other" ? form.genderOther : form.gender}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Profession:</span> <span>{form.profession}</span></div>
                  {form.profession === "Entrepreneur" && (
                    <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Company Name:</span> <span>{form.companyName}</span></div>
                  )}
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Address:</span> <span>{form.address1}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Country:</span> <span>{form.country}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">State:</span> <span>{form.state}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">City:</span> <span>{form.city}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Plan:</span> <span>{form.plan}</span></div>
                  <div className="w-full max-w-xs flex justify-between"><span className="font-medium">Newsletter:</span> <span>{form.newsletter ? "Yes" : "No"}</span></div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 w-full justify-center">
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 flex-1"
                  onClick={handleFinalSubmit}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-4 py-2 flex-1 border"
                  onClick={() => setShowSummary(false)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
        {submitStatus && (
          <div className={`mt-4 text-center ${submitStatus.success ? 'text-green-600' : 'text-red-600'}`}>{submitStatus.message}</div>
        )}
      </form>
    </>
  );
};

export default UserProfileForm;
