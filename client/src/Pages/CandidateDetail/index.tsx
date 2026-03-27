import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Star,
  CheckCircle,
  Award,
  Edit2,
  Trash2,
  AlertCircle,
  Download,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import api from '../../lib/axios';
import type { Candidate } from '../../types';

import { Header } from '../../components/Header';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LoadingButton } from '../../components/LoadingButton';
import { Toast } from '../../components/Toast';

export const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/candidates/${id}`);
      setCandidate(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Impossible de charger les détails du candidat'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VALIDATE
  // =========================
  const handleValidate = async () => {
    if (!confirm('Valider ce candidat ?')) return;

    setValidating(true);
    setError(null);

    try {
      await api.post(`/api/candidates/${id}/validate`);
      setSuccessMessage('Candidat validé avec succès !');

      setTimeout(fetchCandidate, 1200);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur validation');
    } finally {
      setValidating(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    if (!confirm('Supprimer ce candidat ?')) return;

    setDeleting(true);
    setError(null);

    try {
      await api.delete(`/api/candidates/${id}`);
      setSuccessMessage('Candidat supprimé !');

      setTimeout(() => navigate('/candidates'), 1200);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur suppression');
      setDeleting(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = () => {
    navigate(`/candidates/${id}/edit`);
  };

  // =========================
  // EXPORT PDF
  // =========================
  const handleExportPDF = async () => {
    const element = document.getElementById('candidate-pdf');
    if (!element) return;

    setExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = 210;
      const pdfHeight = 297;

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`candidat-${candidate?.name || 'profil'}.pdf`);

      setSuccessMessage('PDF exporté avec succès !');
    } catch (err) {
      setError("Erreur lors de l'export PDF");
    } finally {
      setExporting(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" message="Chargement du candidat..." />
        </div>
      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================
  if (!candidate) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <Header />
        <div className="text-center py-16">
          <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
          <p className="text-lg">Candidat introuvable</p>
          <button
            onClick={() => navigate('/candidates')}
            className="mt-4 px-4 py-2 bg-black text-white rounded"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* TOAST */}
        {successMessage && (
          <Toast
            message={successMessage}
            type="success"
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* BACK */}
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-2 mb-5 text-gray-500 hover:text-black"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* CARD */}
        <div
          id="candidate-pdf"
          className="bg-white dark:bg-gray-900 rounded-xl shadow border p-6"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">{candidate.name}</h1>

              <span
                className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                  candidate.status === 'validated'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {candidate.status === 'validated'
                  ? 'Validé'
                  : 'En attente'}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 flex-wrap">
              <LoadingButton
                onClick={handleExportPDF}
                loading={exporting}
                icon={<Download size={16} />}
              >
                PDF
              </LoadingButton>

              {candidate.status === 'pending' && (
                <LoadingButton
                  onClick={handleValidate}
                  loading={validating}
                  icon={<CheckCircle size={16} />}
                  variant="success"
                >
                  Valider
                </LoadingButton>
              )}

              <LoadingButton
                onClick={handleEdit}
                icon={<Edit2 size={16} />}
                variant="warning"
              >
                Modifier
              </LoadingButton>

              <LoadingButton
                onClick={handleDelete}
                loading={deleting}
                icon={<Trash2 size={16} />}
                variant="danger"
              >
                Supprimer
              </LoadingButton>
            </div>
          </div>

          {/* INFOS */}
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <Info icon={<Mail />} label="Email" value={candidate.email} />
              <Info icon={<Phone />} label="Téléphone" value={candidate.phone} />
              <Info
                icon={<Briefcase />}
                label="Poste"
                value={candidate.position}
              />
            </div>

            <div className="space-y-3">
              <Info
                icon={<Star />}
                label="Expérience"
                value={`${candidate.experience} ans`}
              />
              <Info
                icon={<Award />}
                label="Date"
                value={new Date(candidate.createdAt).toLocaleDateString(
                  'fr-FR'
                )}
              />
            </div>
          </div>

          {/* SKILLS */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// =========================
// COMPONENT REUSABLE
// =========================
const Info = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="text-gray-500">{icon}</div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);