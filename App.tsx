import React, { useState } from 'react';
import Layout from './components/Layout';
import CreateTask from './components/CreateTask';
import PromptRefinement from './components/PromptRefinement';
import PilotValidation from './components/PilotValidation';
import BatchProduction from './components/BatchProduction';
import Dashboard from './components/Dashboard';
import { PromptItem, TaskConfig } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  
  // Application State
  const [taskConfig, setTaskConfig] = useState<TaskConfig | null>(null);
  const [userRequest, setUserRequest] = useState<string>('');
  const [prompts, setPrompts] = useState<PromptItem[]>([]);

  // Handlers
  const handleTaskCreated = (config: TaskConfig, request: string) => {
    setTaskConfig(config);
    setUserRequest(request);
    setStep(2);
  };

  const handlePromptsGenerated = (generatedPrompts: PromptItem[]) => {
    setPrompts(generatedPrompts);
    setStep(3);
  };

  const handleValidationFinished = () => {
    setStep(4);
  };

  const handleProductionFinished = () => {
    setStep(5);
  };

  return (
    <Layout activeStep={step}>
      {step === 1 && (
        <CreateTask onNext={handleTaskCreated} />
      )}
      
      {step === 2 && (
        <PromptRefinement 
          initialRequest={userRequest}
          onNext={handlePromptsGenerated}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && taskConfig && (
        <PilotValidation 
          prompts={prompts}
          config={taskConfig}
          onUpdatePrompts={setPrompts}
          onNext={handleValidationFinished}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <BatchProduction 
          prompts={prompts}
          onFinish={handleProductionFinished}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <Dashboard prompts={prompts} />
      )}
    </Layout>
  );
};

export default App;