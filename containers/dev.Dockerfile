FROM node:18 as builder

ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

COPY packages ./packages
COPY scripts ./scripts

RUN npm ci

# NPM workspaces work by symlinking internal packages in node_nodules
# This doesn't work properly when trying to make light-weight containers...
#RUN find packages -type d -name 'lib-*' -exec sh -c 'npm run -w {} build && mkdir -p libraries/{}/ && cp -r {}/dist libraries/{}/ && cp -r {}/package*.json libraries/{}/' \; 

RUN find packages -maxdepth 1 -type d -wholename '*/*' -exec sh -c 'mkdir -p libraries/{} && cp -r {}/package*.json libraries/{}/' \;

FROM node:18 as runner

RUN apt-get install git -y

# Temporarily lock to this version :(
# See https://github.com/npm/cli/issues/3847
RUN npm install -g npm@7.18.1

ARG PACKAGE
ENV NODE_ENV=development

WORKDIR /app

COPY --from=builder /app/package*.json /app/

# Copy over the prebuilt internal library packages
COPY --from=builder /app/libraries /app/

COPY tsconfig*.json ./
COPY nodemon.json ./
COPY jest.config.js ./

RUN npm ci

COPY --from=builder /app/scripts/* /app/scripts/

CMD [ "npm", "run", "start:dev"]