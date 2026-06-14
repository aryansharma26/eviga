import { motion } from 'framer-motion';
import { Stethoscope, ClipboardList, BookOpen } from 'lucide-react';

const services = [
  {
    icon: Stethoscope,
    title: 'Consult Doctors Online',
    description: 'Connect with 1000+ certified doctors across 30+ specializations.',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&h=300&fit=crop',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: ClipboardList,
    title: 'Health Checkup Packages',
    description: 'Comprehensive wellness packages tailored to your age, gender, and health needs.',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500&h=300&fit=crop',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: BookOpen,
    title: 'Health Tips & Articles',
    description: 'Expert-written articles on wellness, nutrition, diseases, and healthy living.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop',
    color: 'from-orange-500 to-orange-600',
  },
];

const MoreThanPharmacy = () => {
  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            More Than Just a Pharmacy
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Complete healthcare services at your fingertips
          </p>
        </div>

        {/* Services grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-2`}>
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreThanPharmacy;
