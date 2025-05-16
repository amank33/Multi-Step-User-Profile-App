import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = ({ onModify }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/user/all`);
        setUsers(res.data || []);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* <h1 className="text-2xl font-bold text-center mb-8">All Users</h1> */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img
              src={user.profilePhoto?.startsWith('/') ? `${API_BASE_URL}${user.profilePhoto}` : user.profilePhoto}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-300 mb-3"
              onError={e => (e.target.src = '/icon.svg')}
            />
            <div className="font-semibold text-lg mb-2">{user.username}</div>
            <div className='flex items-center gap-2'>
                 <button className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1 mt-2" onClick={() => onModify(user)}>
              Modify
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-1 mt-2"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this user?')) {
                  try {
                    await axios.patch(`${API_BASE_URL}/api/users/user/delete/${user._id}`);
                    setUsers(users => users.filter(u => u._id !== user._id));
                  } catch (err) {
                    alert('Failed to delete user');
                  }
                }
              }}
            >
              Delete
            </button>
                </div>
           
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
