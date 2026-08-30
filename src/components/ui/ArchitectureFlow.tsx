import "./ArchitectureFlow.css";

interface ArchitectureFlowProps {
  steps: string[];
}

/**
 * Animated "problem -> production" flow for flagship projects.
 * Renders each stage as a node with connectors and a traveling packet.
 * Pure CSS/DOM — accessible as a list, decorative motion only.
 */
export function ArchitectureFlow({ steps }: ArchitectureFlowProps) {
  return (
    <div className="archflow">
      <p className="archflow__label">Architecture</p>
      <ol className="archflow__track">
        {steps.map((step, i) => (
          <li key={step} className="archflow__step">
            <span className="archflow__node">{step}</span>
            {i < steps.length - 1 && (
              <span className="archflow__link" aria-hidden="true">
                <span className="archflow__packet" style={{ animationDelay: `${i * 0.4}s` }} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
