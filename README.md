<!-- Just desperately trying to get APIs to work.

This actually works (!!!), but you need to configure apache a bit.

https://www.digitalocean.com/community/tutorials/how-to-use-apache-http-server-as-reverse-proxy-using-mod_proxy-extension

In `/etc/apache2/sites-enabled/CONF-FILE.conf`, add in `ProxyPass / http://localhost:3000/`

Then enable proxy mods with `a2enmod`. Enable these mods: `proxy proxy_ajp proxy_http rewrite deflate headers proxy_balancer proxy_connect proxy_html`

I'm also using pm2 on the server to manage the node script. As git user: `pm2 start SCRIPT_NAME`
---

I think this is going to be designed on top of any built react app. Just need to change how to start the app up.
-->

# RESTful API Template

## Setup

Make sure you install this on the same directory of the `build` (Folder that's the result of running `npm run build`). It just sits on top of it and leaves your react project untouched.

## Folder Structure:

    $ ReactProjectName
    ├── build/
    │ ├── // Your built react project
    │ ├── static/
    │ ├── images/
    │ ├── index.html
    │ └── etc....
    ├── // This repo
    ├── node_modules/
    ├── mysql-info.json
    ├── package.json
    ├── package-lock.json
    └── server.js

## Configure Environment

Install node modules

    $ npm install

And global modules

    $ npm install nodemon -g
    $ npm install pm2 -g

Create `mysql-info.json`

    $ echo '{"host": "localhost","user": "MYSQL_USER","password": "MYSQL_PASS","database":"DB_NAME","port": "/var/run/mysqld/mysqld.sock"}' > mysql-info.json

## Configure Server for Proxies

For an apache server, go to your site's .conf ( `/etc/apache2/sites-enabled/SITE_NAME.conf` ) file and add the following:

    <VirtualHost>
            ...

            ProxyPass / http://localhost:3000/

            ...
    </VirtualHost>

Then enable proxy mods

    $ a2enmod proxy
    $ a2enmod proxy_http
    $ a2enmod proxy_ajp
    $ a2enmod rewrite
    $ a2enmod deflate
    $ a2enmod headers
    $ a2enmod proxy_balancer
    $ a2enmod proxy_connect
    $ a2enmod proxy_html

And restart apache

    $ /etc/init.d/apache2 restart

Now you can run the server through pm2 if you want. It will allow for easy restarting and automatic

    $ pm2 start server.js

---

---

## ..hm? what?

This project allows a RESTful API to sit on top of any react project you build.

In its current state, it points to the [sakila example database](https://dev.mysql.com/doc/sakila/en/). I'd like to build this project out so it can build out for any database's needs.
