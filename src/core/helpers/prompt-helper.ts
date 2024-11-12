import { confirm } from '@inquirer/prompts';

export async function handlePromptTemplate(
  customPrompts?: () => Promise<void>
): Promise<void> {
  const shouldCustomizeTemplate = await confirm({
    message: 'Deseja personalizar o template?',
  });

  if (customPrompts && shouldCustomizeTemplate) {
    await customPrompts();
  }

  await confirm({
    message:
      'Deseja substituir a rota principal? Com isso, o template será exibido assim que for gerado.',
  });
}
