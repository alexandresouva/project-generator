import { confirm } from '@inquirer/prompts';

export async function handlePromptTemplate<T>(
  customPrompts?: () => Promise<T>
): Promise<T | undefined> {
  let answers: T | undefined;
  const shouldCustomizeTemplate = await confirm({
    message: 'Deseja personalizar o template?',
  });

  if (customPrompts && shouldCustomizeTemplate) {
    answers = await customPrompts();
  }

  await confirm({
    message:
      'Deseja substituir a rota principal? Com isso, o template será exibido assim que for gerado.',
  });

  return answers;
}
