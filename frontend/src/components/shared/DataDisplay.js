import React, { useState, useEffect } from 'react';
import { getData } from '../services/api.service';

function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getData();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="data-container">
      <h2>Data from Database</h2>
      <div className="data-list">
        {data.map((item) => (
          <div key={item.id} className="data-item">
            {/* اینجا فیلدهای مورد نظر خود را نمایش دهید */}
            <p>{item.name}</p>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataDisplay; 