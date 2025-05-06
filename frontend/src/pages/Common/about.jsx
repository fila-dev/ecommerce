

import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            About Our E-Shop
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Your one-stop destination for quality products
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Our Story
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Founded with a passion for delivering exceptional products, our e-shop has grown into a trusted marketplace where quality meets convenience. We carefully curate our selection to ensure customer satisfaction.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Our Promise
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We are committed to providing authentic products, competitive prices, and excellent customer service. Every purchase is backed by our satisfaction guarantee.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Us
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                • Fast & Secure Shipping
                • 24/7 Customer Support
                • Easy Returns
                • Quality Guaranteed
                • Best Price Promise
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Our Numbers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">5K+</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">99%</div>
              <div className="mt-2 text-gray-600 dark:text-gray-300">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Questions or concerns? Reach out to us at support@eshop.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;

