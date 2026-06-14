import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Calendar, Clock, Video, MessageSquare, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const specialties = [
  { name: 'General Physician', icon: Stethoscope, doctors: 120, wait: '5 min' },
  { name: 'Dermatology', icon: Stethoscope, doctors: 45, wait: '10 min' },
  { name: 'Cardiology', icon: Stethoscope, doctors: 30, wait: '15 min' },
  { name: 'Pediatrics', icon: Stethoscope, doctors: 55, wait: '8 min' },
  { name: 'Orthopedics', icon: Stethoscope, doctors: 25, wait: '12 min' },
  { name: 'Gynecology', icon: Stethoscope, doctors: 35, wait: '10 min' },
  { name: 'Neurology', icon: Stethoscope, doctors: 20, wait: '20 min' },
  { name: 'Psychiatry', icon: Stethoscope, doctors: 15, wait: '15 min' },
];

const Consult = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  return (
    <div className="container-custom py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a4d3a] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Consult Doctors Online</h1>
        <p className="text-gray-600 max-w-xl mx-auto">Connect with 1000+ certified doctors across 30+ specializations. Get medical advice from the comfort of your home.</p>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Video, title: 'Choose Doctor', desc: 'Browse and select a specialist' },
          { icon: Calendar, title: 'Book Slot', desc: 'Pick a convenient time' },
          { icon: MessageSquare, title: 'Get Consultation', desc: 'Video or chat consultation' },
        ].map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-[#1a4d3a]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-6 h-6 text-[#1a4d3a]" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-500">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Specialties */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Select Specialization</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {specialties.map((spec, i) => (
          <motion.button
            key={spec.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedSpecialty(spec.name)}
            className={`bg-white border rounded-2xl p-5 text-left hover:shadow-md transition-all ${
              selectedSpecialty === spec.name ? 'border-[#1a4d3a] bg-[#1a4d3a]/5' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-[#1a4d3a]/10 rounded-xl flex items-center justify-center">
                <spec.icon className="w-5 h-5 text-[#1a4d3a]" />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {spec.wait}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{spec.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{spec.doctors} doctors available</p>
          </motion.button>
        ))}
      </div>

      {selectedSpecialty && (
        <div className="mt-8 bg-[#1a4d3a]/5 border border-[#1a4d3a]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-[#1a4d3a]" />
            <div>
              <p className="font-semibold text-gray-900">You selected: {selectedSpecialty}</p>
              <p className="text-sm text-gray-600">This feature will be available soon. Please check back later.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Consult;
