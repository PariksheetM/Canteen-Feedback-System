import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editingRating, setEditingRating] = useState<number>(0);

  const fetchFeedback = async () => {
    setError('');
    try {
  const res = await fetch('http://192.168.1.14:4000/admin/feedback');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch feedback');
  // Sort feedback by timestamp descending (newest first)
  // For each feedback, calculate overall rating (average of all question ratings)
  const processed = [...data.feedback].map(fb => {
    let overallRating = 0;
    if (Array.isArray(fb.responses) && fb.responses.length > 0) {
      overallRating = fb.responses.reduce((sum, r) => sum + (r.rating || 0), 0) / fb.responses.length;
      overallRating = Math.round(overallRating * 100) / 100; // round to 2 decimals
    } else if (typeof fb.rating === 'number') {
      overallRating = fb.rating;
    }
    return { ...fb, overallRating };
  }).sort((a, b) => b.timestamp - a.timestamp);
  setFeedback(processed);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleEdit = (id: string, rating: number) => {
    setEditingId(id);
    setEditingRating(rating);
  };

  const handleSave = async (id: string) => {
    setError('');
    try {
  const res = await fetch(`http://192.168.1.14:4000/admin/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editingRating })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update feedback');
      setEditingId(null);
      setEditingRating(0);
      fetchFeedback();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
  const res = await fetch(`http://192.168.1.14:4000/admin/feedback/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete feedback');
      fetchFeedback();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-2xl mt-10">
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl py-2 mb-4 shadow flex items-center justify-between px-4">
  <h2 className="text-xl font-bold text-white">Manage Feedback Submissions</h2>
        <span className="text-white font-semibold text-base">Total: {feedback.length}</span>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded font-bold ml-4 text-xs"
          onClick={() => {
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'ID,Timestamp,Site,Canteen,Username,OverallRating\r\n';
            feedback.forEach(fb => {
              const row = [
                fb.id,
                new Date(fb.timestamp).toLocaleString(),
                fb.site,
                fb.canteen_id,
                fb.username || '',
                fb.overallRating
              ];
              csvContent += row.join(',') + '\r\n';
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'feedback_submissions.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >Export CSV</button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse mb-6 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Timestamp</th>
              <th className="p-3 border">Site</th>
              <th className="p-3 border">Canteen</th>
              <th className="p-3 border">Username</th>
              <th className="p-3 border">Overall Rating</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((fb: any, idx: number) => (
              <tr key={fb.id} className={"transition-colors duration-200 " + (idx % 2 === 0 ? "bg-white" : "bg-gray-50") + " hover:bg-primary-50"}>
                <td className="p-3 border">{new Date(fb.timestamp).toLocaleString()}</td>
                <td className="p-3 border">{fb.site}</td>
                <td className="p-3 border">{fb.canteen_id}</td>
                <td className="p-3 border">{fb.username || <span style={{ color: '#aaa' }}>-</span>}</td>
                <td className="p-3 border">
                  <span className="font-bold text-primary-700">{fb.overallRating}</span>
                </td>
                <td className="p-3 border">
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(fb.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow text-xs">
                      <FaTrash className="inline" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {feedback.length === 0 && <p className="text-gray-500 text-center">No feedback submissions found.</p>}
    </div>
  );
};

export default AdminFeedback;
