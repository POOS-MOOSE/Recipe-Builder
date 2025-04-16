#!/bin/bash

SESSION="server"

tmux has-session -t $SESSION 2>/dev/null
if [ $? -eq 0 ]; then
	    tmux kill-session -t $SESSION
fi

tmux new-session -d -s $SESSION
tmux send-keys -t $SESSION:0 'cd server && npm run dev' C-m

rm -r ~/htdocs/*
cp -r client/build/* ~/htdocs/
cp vhost.conf /opt/bitnami/apache/conf/vhosts/vhost.conf
sudo /opt/bitnami/ctlscript.sh restart apache


