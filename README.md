Just desperately trying to get APIs to work.

This actually works (!!!), but you need to configure apache a bit.

https://www.digitalocean.com/community/tutorials/how-to-use-apache-http-server-as-reverse-proxy-using-mod_proxy-extension

In `/etc/apache2/sites-enabled/CONF-FILE.conf`, add in `ProxyPass / http://localhost:3000/`

Then enable proxy mods with `a2enmod`. Enable these mods: `proxy proxy_ajp proxy_http rewrite deflate headers proxy_balancer proxy_connect proxy_html`

I'm also using pm2 on the server to manage the node script. As git user: `pm2 start SCRIPT_NAME`
