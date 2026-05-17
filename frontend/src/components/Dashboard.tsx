import React from 'react';
import { LoanDashboard } from './LoanDashboard';
import LoanDetails from './LoanDetails';
import DefaultResolution from './DefaultResolution';
import { OracleMembers } from './OracleMembers';

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-unit-xl w-full flex-1 flex flex-col">
      <div className="grid grid-cols-12 gap-gutter flex-1">
        <LoanDashboard />
        <div className="col-span-12 mt-4">
          <LoanDetails />
        </div>
        <div className="col-span-12 mt-4">
          <OracleMembers />
        </div>
        <div className="col-span-12 mt-4">
          <DefaultResolution />
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-unit-xl mt-12 bg-background z-10">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-unit-md">
          <p className="text-body-md font-body-md text-on-surface-variant m-0">© 2024 Credipro Protocol. All proofs verified.</p>
          <div className="flex gap-8">
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-tertiary transition-colors no-underline" href="#">Privacy Policy</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-tertiary transition-colors no-underline" href="#">Terms of Service</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-tertiary transition-colors no-underline" href="#">Docs</a>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-tertiary transition-colors no-underline" href="#">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
