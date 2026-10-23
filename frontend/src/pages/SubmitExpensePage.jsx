import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { expenseService } from '../services/api';
import { categories } from '../utils/formatters';
import { Upload, CheckCircle2, Send, ArrowLeft } from 'lucide-react';

const SubmitExpensePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useAuth();

  const editExpense = location.state?.editExpense || null;

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseLocation, setExpenseLocation] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [imageThumbnail, setImageThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => () => {
    if (imageThumbnail) URL.revokeObjectURL(imageThumbnail);
  }, [imageThumbnail]);

  useEffect(() => {
    if (editExpense) {
      setAmount(editExpense.amount);
      setCurrency(editExpense.currency || 'INR');
      setCategory(editExpense.category || '');
      setDescription(editExpense.description || '');
      setDate(editExpense.date ? editExpense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
      setExpenseLocation(editExpense.location || '');
      setVendor(editExpense.vendor || '');
      setNotes(editExpense.notes || '');
      setTags(editExpense.tags ? editExpense.tags.join(', ') : '');
      if (editExpense.receipt) {
        setReceiptPreview(editExpense.receipt);
      }
    }
  }, [editExpense]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Choose a JPG, PNG, GIF, or PDF receipt.', 'error');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Receipt files must be 10 MB or smaller.', 'error');
        e.target.value = '';
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(file.name);
      if (file.type && file.type.startsWith('image/')) {
        setImageThumbnail(URL.createObjectURL(file));
      } else {
        setImageThumbnail(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !currency || !category || !description || !date) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedReceiptUrl = editExpense?.receipt || null;

      // Handle receipt upload if user picked a new file
      if (receiptFile) {
        const uploadRes = await expenseService.uploadReceipt(receiptFile);
        uploadedReceiptUrl = uploadRes.url || uploadRes.filename;
        if (!uploadedReceiptUrl) throw new Error('Receipt upload did not return a file URL.');
      }

      const payload = {
        amount: parseFloat(amount),
        currency,
        category,
        description,
        date,
        location: expenseLocation || null,
        vendor: vendor || null,
        notes: notes || null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        receipt: uploadedReceiptUrl,
      };

      if (editExpense) {
        await expenseService.updateExpense(editExpense.id, payload);
        showToast('Expense updated successfully!', 'success');
      } else {
        await expenseService.createExpense(payload);
        showToast('Expense submitted successfully for approval!', 'success');
      }

      navigate('/expenses');
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to submit expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 fade-in">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {editExpense ? 'Edit Pending Expense' : 'Submit New Expense'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {editExpense
                ? 'Update your expense claim details before manager review'
                : 'Fill in the form below to submit your business expense for approval'}
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/80 hover:bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </button>
        </div>

        <div className="glass rounded-3xl shadow-xl p-8 border border-white/80 dark:bg-slate-800 dark:border-slate-700 fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                   className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 font-extrabold text-base focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Currency *
                </label>
                <select
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                   className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 font-bold text-sm focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="CAD">CAD (C$) - Canadian Dollar</option>
                  <option value="AUD">AUD (A$) - Australian Dollar</option>
                  <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="">Select Expense Category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Description *
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Flight tickets to Mumbai for client meeting"
                 className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                 className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
              />
            </div>

            {/* Location & Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={expenseLocation}
                  onChange={(e) => setExpenseLocation(e.target.value)}
                  placeholder="Mumbai, India"
                   className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Vendor
                </label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="IndiGo Airlines"
                   className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600"
                />
              </div>
            </div>

            {/* Notes & Tags */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Notes / Justification
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide additional justification or context for approval..."
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:border-slate-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="urgent, client-meeting, quarterly"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white/70 dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            {/* Receipt File Attachment */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Receipt Attachment
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-6 text-center transition-colors bg-white/40 dark:bg-slate-700/40 dark:border-slate-600">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold mb-3">
                  Upload PDF or receipt image (max 10MB)
                </p>
                <input
                  type="file"
                  id="receiptInput"
                  accept=".jpg,.jpeg,.png,.gif,.pdf,image/jpeg,image/png,image/gif,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('receiptInput').click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  Choose File
                </button>
                {imageThumbnail && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={imageThumbnail}
                      alt="Receipt Preview"
                       className="max-h-36 rounded-xl border border-slate-300 shadow-md object-contain dark:border-slate-600"
                    />
                  </div>
                )}
                {receiptPreview && (
                  <div className="mt-3 inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:bg-emerald-800 dark:text-emerald-200 dark:border-emerald-700">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Attached: {receiptPreview}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center space-x-4 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : editExpense ? 'Update Expense' : 'Submit Expense'}
              </button>
               <button
                 type="button"
                 onClick={() => navigate('/expenses')}
                 className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold text-sm transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-100"
               >
                 Cancel
               </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitExpensePage;
