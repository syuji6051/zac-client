from node:12-alpine

# RUN apt-get update \
#     && apt-get install -y wget gnupg \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update \
#     && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
#       --no-install-recommends \
#     && rm -rf /var/lib/apt/lists/*

# japanese font
RUN apk add --no-cache curl fontconfig font-noto-cjk \
  && fc-cache -fv

# Installs latest Chromium (77) package.
RUN apk add --no-cache \
      chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR app
COPY . app/
