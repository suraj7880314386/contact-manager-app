import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, User, Mail, Phone, MessageSquare, Plus, Search, Users, Copy, Check } from 'lucide-react';

const API_URL = 'https://contact-api-fas0.onrender.com/api/contacts'; 

function App() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [sortBy, setSortBy] = useState('newest'); 
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(API_URL);
      setContacts(res.data);
    } catch (err) { console.error("Error", err); }
  };

  const filteredContacts = contacts
    .filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const copyToClipboard = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validate = (name, value) => {
    let errorMsg = '';
    
    if (name === 'name' && !value.trim()) {
      errorMsg = 'Name is required';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) errorMsg = 'Email is required';
      else if (!emailRegex.test(value)) errorMsg = 'Invalid email address';
    }

    if (name === 'phone') {
      const phoneRegex = /^[0-9\-\+\s]{10,15}$/; 
      if (!value.trim()) errorMsg = 'Phone is required';
      else if (!phoneRegex.test(value)) errorMsg = 'Invalid phone number (min 10 digits)';
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validate(name, value);
  };

  const isFormValid = () => {
    return formData.name && formData.email && formData.phone && !errors.name && !errors.email && !errors.phone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setIsSubmitting(true);
    try {
      await axios.post(API_URL, formData);
      setSuccessMsg('Successfully Added!');
      setFormData({ name: '', email: '', phone: '', message: '' }); 
      fetchContacts(); 
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) { alert("Server Error"); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this contact?")) return;
    try { await axios.delete(`${API_URL}/${id}`); fetchContacts(); } 
    catch (err) { console.error(err); }
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const getAvatarColor = (name) => {
    const colors = ['from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-600', 'from-purple-500 to-pink-600'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      <nav className="bg-white sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-200">
              <Users size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Contact<span className="text-indigo-600">Manager</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Total: <span className="text-indigo-600 font-bold ml-1">{contacts.length}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Plus size={20} className="bg-white/20 rounded p-0.5" /> Add New Contact
                </h2>
                <p className="text-indigo-100 text-xs mt-1 opacity-90">Create a new entry in your digital phonebook.</p>
              </div>

              <div className="p-6">
                {successMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm font-semibold border border-green-100 flex items-center gap-2 animate-bounce-short">
                    <Check size={16} /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Full Name", name: "name", icon: User, type: "text", placeholder: "e.g. Suraj Singh" },
                    { label: "Email Address", name: "email", icon: Mail, type: "email", placeholder: "e23cseu1384@bennett.edu.in" },
                    { label: "Phone Number", name: "phone", icon: Phone, type: "text", placeholder: "7880314386" }
                  ].map((field) => (
                    <div key={field.name} className="group">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">{field.label}</label>
                      <div className="relative">
                        <field.icon className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type={field.type} name={field.name}
                          value={formData[field.name]} onChange={handleChange}
                          placeholder={field.placeholder}
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl font-medium text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none ${errors[field.name] ? 'border-red-400' : 'border-slate-200 focus:border-indigo-500'}`}
                        />
                      </div>
                      {errors[field.name] && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors[field.name]}</p>}
                    </div>
                  ))}

                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block ml-1">Message</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                      <textarea 
                        name="message" rows="2"
                        value={formData.message} onChange={handleChange}
                        placeholder="Optional notes..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!isFormValid() || isSubmitting}
                    className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0
                      ${(!isFormValid() || isSubmitting) 
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-300 hover:to-indigo-700'}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Contact'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-40">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</span>
                <button 
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${sortBy === 'newest' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Newest
                </button>
                <button 
                  onClick={() => setSortBy('name')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${sortBy === 'name' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  Name (A-Z)
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {filteredContacts.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-slate-600 font-medium">No contacts found</h3>
                  <p className="text-slate-400 text-sm mt-1">Try changing your search term.</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div key={contact._id} className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1 relative">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(contact.name)} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight capitalize">{contact.name}</h3>
                          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(contact._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Contact"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div 
                        onClick={() => copyToClipboard(contact.email, `email-${contact._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 group-hover:bg-indigo-50/50 border border-transparent group-hover:border-indigo-100 transition-all cursor-pointer"
                        title="Click to Copy"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600 truncate font-medium">{contact.email}</span>
                        </div>
                        {copiedField === `email-${contact._id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
                      </div>
                      <div 
                        onClick={() => copyToClipboard(contact.phone, `phone-${contact._id}`)}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 group-hover:bg-indigo-50/50 border border-transparent group-hover:border-indigo-100 transition-all cursor-pointer"
                        title="Click to Copy"
                      >
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-violet-500" />
                          <span className="text-sm text-slate-600 font-medium">{contact.phone}</span>
                        </div>
                        {copiedField === `phone-${contact._id}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-300 opacity-0 group-hover:opacity-100" />}
                      </div>
                    </div>

                    {contact.message && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500 italic">
                          <span className="font-semibold text-indigo-400 not-italic mr-1">Note:</span> 
                          {contact.message}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;