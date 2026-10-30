export const integrationIcons = [
  'cc-switch',
  'claude-code',
  'codex',
  'opencode',
  'deepseek-harness',
  'cline',
  'cursor',
  'gemini-cli',
  'zed',
  'workbuddy',
  'cherry-studio',
  'chatbox',
  'openai-sdk',
  'langchain',
  'llamaindex'
] as const

export type IntegrationIconName = (typeof integrationIcons)[number]

export function IntegrationIcon({ name }: { name: IntegrationIconName }) {
  if (name === 'workbuddy' || name === 'cc-switch') {
    return (
      <img
        src={`/integrations/${name}.svg`}
        alt=""
        aria-hidden="true"
        width={16}
        height={16}
        className="fenno-integration-icon fenno-integration-image"
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="fenno-integration-icon"
      style={{ maskImage: `url(/integrations/${name}.svg)` }}
    />
  )
}

export function IntegrationLabel({ name, title }: { name: IntegrationIconName; title: string }) {
  return (
    <span className="fenno-integration-label">
      <IntegrationIcon name={name} />
      <span>{title}</span>
    </span>
  )
}
