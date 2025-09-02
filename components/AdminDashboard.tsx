
import React, { useState, useEffect, useMemo } from 'react';
import { FaTachometerAlt, FaQuestionCircle, FaComments, FaMapMarkerAlt, FaQrcode, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { feedbackService } from '../services/feedbackService';
import { FeedbackSubmission, Question, RatingLevel } from '../types';
import { RATINGS } from '../constants';

// Pie chart colors for rating levels
const PIE_COLORS = ['#4caf50', '#fbc02d', '#ff9800', '#d32f2f'];
import StatCard from './StatCard';
import QRCode from 'react-qr-code';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TimeFrame = 'daily' | 'weekly' | 'monthly';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  useEffect(() => {
    // Fetch feedback submissions from backend
    fetch('http://192.168.1.14:4000/feedback')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.feedback)) {
          setFeedbackData(data.feedback);
        }
      });
  }, []);
  // Export feedback data to CSV
  const exportToCSV = () => {
    if (!feedbackData.length) return;
    const headers = ['Site', 'Canteen', 'Username', 'Timestamp', ...questions.map(q => q.text)];
    const rows = feedbackData.map(fb => [
      fb.site,
      fb.canteen,
      fb.username || '',
      fb.timestamp || '',
      ...fb.responses.map(r => r.rating)
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback_submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const [feedbackData, setFeedbackData] = useState<FeedbackSubmission[]>([]);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [selectedSite, setSelectedSite] = useState<string>('All Sites');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [sites, setSites] = useState<string[]>([]);

  useEffect(() => {
    // Fetch sites from backend
    fetch('http://192.168.1.14:4000/sites')
      .then(res => res.json())
      .then(data => setSites(data.sites || []));
  }, []);

  // Example analytics calculation (replace with your actual logic)
  const analytics = useMemo(() => {
    const totalSubmissions = feedbackData.length;
    const positiveCount = feedbackData.filter(fb => fb.responses.some(r => r.rating >= 3)).length;
    const positivePercentage = totalSubmissions ? (positiveCount / totalSubmissions) * 100 : 0;
    const ratingDistribution = RATINGS.map(r => ({
      name: r.label,
      value: feedbackData.reduce((acc, fb) => acc + fb.responses.filter(resp => resp.rating === r.level).length, 0)
    }));
    return { totalSubmissions, positivePercentage, ratingDistribution };
  }, [feedbackData]);

  return (

<div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
      {/* Main dashboard content */}
      <main style={{ padding: '1em', width: '100%' }}>
  
        {/* Stat cards and analytics */}
        <div className="card" style={{ padding: '1em 0.7em' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
            <h1 style={{ fontSize: '1.3em', fontWeight: 700 }}>Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '0.7em' }}>
              <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} style={{ padding: '0.3em', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px' }}>
                <option value="All Sites">All Sites</option>
                {sites.map((siteRaw, idx) => {
                  const site: any = siteRaw;
                  let siteLabel = '';
                  let siteValue = '';
                  if (typeof site === 'string') {
                    siteLabel = site;
                    siteValue = site;
                  } else if (site && typeof site === 'object') {
                    // Use type guards to check for properties
                    if ('location' in site && typeof site.location === 'string') {
                      siteLabel = site.location;
                      siteValue = site.location;
                    } else if ('branch_location' in site && typeof site.branch_location === 'string') {
                      siteLabel = site.branch_location;
                      siteValue = site.branch_location;
                    } else {
                      siteLabel = JSON.stringify(site);
                      siteValue = JSON.stringify(site);
                    }
                  } else {
                    siteLabel = String(site);
                    siteValue = String(site);
                  }
                  return (
                    <option key={siteValue + '-' + idx} value={siteValue}>{siteLabel}</option>
                  );
                })}
              </select>
              <button onClick={exportToCSV} style={{ background: 'var(--success-color)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3em 0.7em', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>Export CSV</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1em', marginBottom: '1em' }}>
            <StatCard title="Total Submissions" value={analytics.totalSubmissions.toString()} />
            <StatCard title="Positive Feedback" value={`${analytics.positivePercentage.toFixed(1)}%`} description="Ratings of 'Good' or 'Average'" />
            <StatCard title="Most Common Feedback" value={analytics.ratingDistribution.reduce((prev, current) => (prev.value > current.value) ? prev : current).name} />
          </div>
          {/* Canteen-wise pie charts for selected site */}
          <div style={{ marginBottom: '1em', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '1em' }}>
            <h3 style={{ fontSize: '1em', fontWeight: 600, marginBottom: '0.7em' }}>
              {selectedSite === 'All Sites' ? 'Site-wise Rating Distribution' : `Canteen-wise Rating Distribution for ${selectedSite}`}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1em' }}>
              {selectedSite === 'All Sites'
                ? sites.map((siteRaw, idx) => {
                    // Use only string site names for label and filtering
                    const siteLabel = typeof siteRaw === 'string' ? siteRaw : String(siteRaw);
                    const siteData = feedbackData.filter(fb => fb.site === siteLabel);
                    // Canteen-wise rating for this site
                    const canteens = Array.from(new Set(siteData.map(fb => fb.canteen)));
                    return (
                      <div key={siteLabel + '-' + idx} style={{ minWidth: 140, flex: '1 1 140px', textAlign: 'center' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.3em', fontSize: '1em' }}>{siteLabel}</h4>
                        {canteens.length > 0 ? (
                          canteens.map(canteen => {
                            const canteenData = siteData.filter(fb => fb.canteen === canteen);
                            const ratingCounts: Record<RatingLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
                            let total = 0, count = 0;
                            canteenData.forEach(submission => {
                              submission.responses.forEach(response => {
                                ratingCounts[response.rating]++;
                                total += response.rating;
                                count++;
                              });
                            });
                            const avgRating = count > 0 ? (total / count).toFixed(2) : 'N/A';
                            const pieData = RATINGS.map(r => ({ name: r.label, value: ratingCounts[r.level] }));
                            return (
                              <div key={canteen} style={{ marginBottom: '1em' }}>
                                <div style={{ fontWeight: 500, fontSize: '0.95em', marginBottom: '0.2em' }}>{canteen}</div>
                                <ResponsiveContainer width="100%" height={120}>
                                  <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                      {pieData.map((entry, index) => <Cell key={`cell-${siteLabel}-${canteen}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div style={{ marginTop: '0.3em', fontSize: '0.85em', color: '#444' }}>
                                  <span><b>Avg. Rating:</b> {avgRating}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ color: '#888', fontSize: '0.95em', marginTop: '2em' }}>No feedback data yet for this site.</div>
                        )}
                      </div>
                    );
                  })
                : (() => {
                    // Show canteen-wise pie charts for selected site
                    const canteens = Array.from(new Set(feedbackData.filter(fb => fb.site === selectedSite).map(fb => fb.canteen)));
                    return canteens.map(canteen => {
                      const canteenData = feedbackData.filter(fb => fb.site === selectedSite && fb.canteen === canteen);
                      const ratingCounts: Record<RatingLevel, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
                      let total = 0, count = 0;
                      canteenData.forEach(submission => {
                        submission.responses.forEach(response => {
                          ratingCounts[response.rating]++;
                          total += response.rating;
                          count++;
                        });
                      });
                      const avgRating = count > 0 ? (total / count).toFixed(2) : 'N/A';
                      const pieData = RATINGS.map(r => ({ name: r.label, value: ratingCounts[r.level] }));
                      return (
                        <div key={canteen} style={{ minWidth: 140, flex: '1 1 140px', textAlign: 'center' }}>
                          <h4 style={{ fontWeight: 600, marginBottom: '0.3em', fontSize: '1em' }}>{canteen}</h4>
                          <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div style={{ marginTop: '0.3em', fontSize: '0.85em', color: '#444' }}>
                            <span><b>Canteen:</b> {canteen}</span><br />
                            <span><b>Avg. Rating:</b> {avgRating}</span>
                          </div>
                        </div>
                      );
                    });
                  })()
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;


