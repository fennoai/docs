import { IntegrationLabel } from '../../../../components/integration-icon'

export default {
  index: '接入总览',
  '---coding': { type: 'separator', title: '编程工具' },
  'cc-switch': <IntegrationLabel name="cc-switch" title="CC Switch" />,
  'claude-code': <IntegrationLabel name="claude-code" title="Claude Code" />,
  'codex': <IntegrationLabel name="codex" title="Codex" />,
  'opencode': <IntegrationLabel name="opencode" title="OpenCode" />,
  'deepseek-harness': <IntegrationLabel name="deepseek-harness" title="DeepSeek Harness" />,
  'cline': <IntegrationLabel name="cline" title="Cline" />,
  'cursor': <IntegrationLabel name="cursor" title="Cursor" />,
  'gemini-cli': <IntegrationLabel name="gemini-cli" title="Gemini CLI" />,
  'zed': <IntegrationLabel name="zed" title="Zed" />,
  '---desktop': { type: 'separator', title: '桌面应用' },
  'workbuddy': <IntegrationLabel name="workbuddy" title="WorkBuddy" />,
  'cherry-studio': <IntegrationLabel name="cherry-studio" title="Cherry Studio" />,
  'chatbox': <IntegrationLabel name="chatbox" title="Chatbox" />,
  '---development': { type: 'separator', title: '应用开发' },
  'openai-sdk': <IntegrationLabel name="openai-sdk" title="OpenAI SDK" />,
  'langchain': <IntegrationLabel name="langchain" title="LangChain" />,
  'llamaindex': <IntegrationLabel name="llamaindex" title="LlamaIndex" />,
  others: '通用接入与排错'
}
