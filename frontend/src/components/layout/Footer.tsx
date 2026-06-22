import React from 'react';
import { GraduationCap, Github, Linkedin, Twitter, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand block */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="rounded-lg bg-blue-600 p-2">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">CloudForge</span>
            </Link>
            <p className="text-sm text-slate-400">
              Next-generation LMS empowering engineers to build the future of Cloud, DevOps, AI, and Systems Architecture.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors duration-200"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors duration-200"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors duration-200"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors duration-200"><Globe className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Top Curriculums</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalog?category=kubernetes" className="hover:text-white transition-colors duration-200">Kubernetes Administration</Link></li>
              <li><Link to="/catalog?category=docker" className="hover:text-white transition-colors duration-200">Docker Containment</Link></li>
              <li><Link to="/catalog?category=terraform" className="hover:text-white transition-colors duration-200">Infrastructure as Code</Link></li>
              <li><Link to="/catalog?category=generative-ai" className="hover:text-white transition-colors duration-200">Generative AI & LLMs</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation & API</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Community Forums</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">System Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Platform Analytics</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Academy</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          <p>© {new Date().getFullYear()} CloudForge Academy Inc. All rights reserved. Created for professional DevOps practitioners.</p>
        </div>
      </div>
    </footer>
  );
};
