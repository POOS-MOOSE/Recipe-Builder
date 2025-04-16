#!/bin/bash

SESSION="server"

tmux has-session -t $SESSION 2>/dev/null
if [ $? != 0 ]; then
    tmux new-session -d -s $SESSION
fi

tmux send-keys -t $SESSION:0 'cd server && npm run dev' C-m

cp -r client/build/* ~/htdocs/

cp vhost.conf /opt/bitnami/apache/conf/vhosts/vhost.conf

sudo /opt/bitnami/ctlscript.sh restart apache


