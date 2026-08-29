# Minha Saúde Feminina

Aplicação de apoio à saúde feminina composta por um aplicativo mobile e um painel administrativo web. O app reúne conteúdos educativos, autenticação, perfil e acompanhamento estimado do ciclo menstrual. O painel web funciona como um painel administrativo para que administradores criem, editem, publiquem e removam artigos exibidos no aplicativo.

## Tecnologias

- React Native
- React
- Expo
- Expo Router
- Vite
- React Router DOM
- TypeScript
- Supabase

## Variáveis de ambiente

Crie um arquivo .env na raiz para o aplicativo mobile:

env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica


Crie outro arquivo web-admin/.env para o painel:

env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-ou-publicavel


### Aplicativo mobile

Na raiz do projeto:

bash
npm install
npm start


No terminal interativo do Expo, escolha Android, iOS ou web. Também estão disponíveis:

bash
npm run android
npm run ios
npm run web


### Painel administrativo (WEB)

Em outro terminal:

bash
cd web-admin
npm install
npm run dev


O Vite exibirá a URL local do painel. Entre com um usuário autenticado cujo perfil esteja marcado como administrador.

## Autores

- Bernardo Gallina
- Gabriel Linhares
- Vitor Heiderscheidt