import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Shield, Zap, Users, ArrowRight, Github, ExternalLink } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with bcrypt password hashing and secure token management.',
  },
  {
    icon: Zap,
    title: 'Fast & Responsive',
    description: 'Built with Next.js and TailwindCSS for optimal performance and beautiful UI.',
  },
  {
    icon: Users,
    title: 'User Management',
    description: 'Complete user profile management with role-based access control.',
  },
  {
    icon: CheckCircle,
    title: 'Task Management',
    description: 'Full CRUD operations with search, filter, and priority management.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>Primetrade - Scalable Web App</title>
        <meta name="description" content="A scalable web application with authentication and dashboard features" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">Primetrade</h1>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="btn btn-primary"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn btn-primary"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Scalable Web App with
              <span className="text-primary-600"> Authentication</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A modern, secure, and scalable web application built with Next.js, Node.js, and MongoDB. 
              Features complete authentication, user management, and task management with a beautiful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    href="/auth/register"
                    className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="btn btn-outline text-lg px-8 py-3"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for Scale & Security
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every feature is designed with production-ready scalability and security in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Modern Tech Stack
              </h2>
              <p className="text-lg text-gray-600">
                Built with industry-leading technologies for optimal performance and developer experience.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'Next.js', description: 'React Framework' },
                { name: 'TypeScript', description: 'Type Safety' },
                { name: 'TailwindCSS', description: 'Styling' },
                { name: 'Node.js', description: 'Backend Runtime' },
                { name: 'Express', description: 'Web Framework' },
                { name: 'MongoDB', description: 'Database' },
                { name: 'JWT', description: 'Authentication' },
                { name: 'bcrypt', description: 'Password Hashing' },
              ].map((tech, index) => (
                <div key={index} className="text-center">
                  <div className="bg-gray-50 rounded-lg p-4 mb-2">
                    <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust our scalable architecture for their projects.
            </p>
            {!user && (
              <Link
                href="/auth/register"
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold text-lg inline-flex items-center transition-colors duration-200"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold">Primetrade</h3>
                <p className="text-gray-400 mt-1">Scalable Web Applications</p>
              </div>
              <div className="flex items-center space-x-6">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <ExternalLink className="h-6 w-6" />
                </a>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Primetrade. Built for demonstration purposes.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

