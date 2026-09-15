import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Spinner } from './ui/primitives';

export default function DownloadHistory() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/releases', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al cargar releases');
      const data = await response.json();
      setReleases(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><Spinner className="spinner-24" /></Card>;
  }

  if (error) {
    return <Card><p className="text-error">Error: {error}</p></Card>;
  }

  if (releases.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted">No hay releases disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Releases</CardTitle>
      </CardHeader>
      <CardContent>
        {releases.map((release) => (
          <div key={release.id} className="release-item">
            <div className="release-info">
              <span className="release-version">{release.version}</span>
              <span className="release-date">{new Date(release.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div className="release-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = `/api/releases/${release.id}/download`}
              >
                Descargar
              </Button>
              <span className="release-size">{release.fileSize}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}