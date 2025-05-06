import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
      {/* Animated background waves */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(45deg, #4169E1 0%, #00BFFF 100%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(-45deg, #1E90FF 0%, #87CEEB 100%)",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Sparkle effects */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left space-y-6"
          >
            <motion.h1
              className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Your One-Stop Shop
              </motion.span>
              <motion.span
                className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                For Everything Tech
              </motion.span>
            </motion.h1>
            <motion.p
              className="max-w-md mx-auto md:mx-0 text-lg text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Explore our vast collection of premium electronics, gadgets, and
              accessories. From smartphones to smart home devices, we have
              everything you need to stay connected and empowered in the digital
              age.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#1E40AF" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const targetSection = document.querySelector(".bg-gray-50");
                  if (targetSection) {
                    targetSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="px-8 py-3 text-base font-semibold rounded-lg text-white bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Shop Now
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/about"
                  className="px-8 py-3 text-base font-semibold rounded-lg text-blue-700 bg-white border-2 border-blue-700 hover:bg-blue-50 hover:border-blue-800 hover:text-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="hidden md:block relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 to-blue-500/20 rounded-2xl" />
            <motion.img
              // src="src/assets/hello.svg
             src="https://i.ibb.co/2YZ48vgW/hello.png"
              alt="E-commerce Shopping Illustration"
              className="w-full h-auto rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300"
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
