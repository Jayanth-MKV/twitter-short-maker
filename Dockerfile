FROM node:20-bookworm

RUN apt-get update
RUN apt-get install -y chromium

# Copy everything from your project to the Docker image. Adjust if needed.
COPY package.json package*.json yarn.lock* pnpm-lock.yaml* bun.lockb* tsconfig.json* remotion.config.* .prettierrc* ./
COPY src ./src

# If you have a public folder:
COPY public ./public

# Install the right package manager and dependencies. Adjust if needed.
RUN npm i

CMD ["npx", "remotion studio", "--ipv4"]