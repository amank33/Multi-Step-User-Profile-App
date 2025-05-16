import React from 'react';
import UserProfileForm from './components/UserProfileForm';
import Dashboard from './components/Dashboard';

function App() {
  const [showDashboard, setShowDashboard] = React.useState(true);
  const [editUser, setEditUser] = React.useState(null);

  const handleModify = user => {
    setEditUser(user);
    setShowDashboard(false);
  };

  const handleAddNew = () => {
    setEditUser(null);
    setShowDashboard(false);
  };

  const handleFormSuccess = () => {
    setShowDashboard(true);
    setEditUser(null);
  };

  return (
    <div>
      <div className="flex gap-4 justify-center mt-4">
        <button
          className={`px-4 py-2 rounded ${showDashboard ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setShowDashboard(true)}
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-2 rounded ${!showDashboard ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={handleAddNew}
        >
          User Profile Form
        </button>
      </div>
      <div className="mt-6">
        {showDashboard ? (
          <Dashboard onModify={handleModify} />
        ) : (
          <UserProfileForm user={editUser} onSuccess={handleFormSuccess} />
        )}
      </div>
    </div>
  );
}

export default App;
