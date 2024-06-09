PRO_DIR="~/baby_breathe/"
echo "start--------------------"
cd $PRO_DIR
echo "pull git code"
git pull
echo "restart server"
pm2 restart server
echo "restart lineserver"
pm2 restart lineserver
echo "finished-----------------"