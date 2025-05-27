import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import type { OnboardingStep } from '@/types';

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
  className?: string;
}

const stepLabels: Record<OnboardingStep, string> = {
  [ONBOARDING_STEPS.CONNECT_WALLET]: 'Conectar Wallet',
  [ONBOARDING_STEPS.LINK_STEAM]: 'Vincular Steam',
  [ONBOARDING_STEPS.SET_TRADE_URL]: 'Configurar Trade URL',
  [ONBOARDING_STEPS.COMPLETE]: 'Completado',
};

const stepNumbers: Record<OnboardingStep, number> = {
  [ONBOARDING_STEPS.CONNECT_WALLET]: 1,
  [ONBOARDING_STEPS.LINK_STEAM]: 2,
  [ONBOARDING_STEPS.SET_TRADE_URL]: 3,
  [ONBOARDING_STEPS.COMPLETE]: 3,
};

export const OnboardingProgress = ({ currentStep, className }: OnboardingProgressProps) => {
  const currentStepNumber = stepNumbers[currentStep];
  const isComplete = currentStep === ONBOARDING_STEPS.COMPLETE;
  const progressValue = isComplete ? 100 : ((currentStepNumber - 1) / 2) * 100;

  return (
    <div className={cn('w-full max-w-md mx-auto mb-8', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">Progreso</span>
        <Badge variant={isComplete ? "default" : "secondary"}>
          {isComplete ? 'Completado' : `${currentStepNumber}/3`}
        </Badge>
      </div>
      
      <Progress value={progressValue} className="w-full mb-4" />
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {isComplete ? (
            <span className="font-medium">🎉 ¡Configuración completada!</span>
          ) : (
            <>
              <span className="font-medium">Paso {currentStepNumber}:</span>{' '}
              <span>{stepLabels[currentStep]}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}; 