#!/bin/bash

# variables
REPO_DIR="/root/PKG"
if getent passwd vagrant ; then
	REPO_DIR="/vagrant_data";
fi

REMOTE_REPO="https://s3.amazonaws.com/s3-mappu"

# x86_64 or i686, i586, etc
ARCH=`uname -m`

echo "################################################################"
echo "# Check provision.log for errors                               #"
echo "#                                                              #"
echo "# Adding repositories, updating and installing base pkgs       #"
echo "# LOCAL REPO=${REPO_DIR} USER=$USER"
echo "################################################################"
(
# update
sudo apt-get -y update 

# add repo mgmt utils
sudo apt-get install -y python-software-properties 
sudo apt-get install -y unzip
sudo apt-get install -y curl
sudo apt-get install -y wget 

# add repositories
sudo add-apt-repository ppa:pitti/postgresql 
sudo add-apt-repository ppa:ubuntugis/ppa 
 
# update
sudo apt-get -y update 
) >> provision.log 2>&1

echo "################################################################"
echo "# Installing postgres, postgis and apache2                     #"
echo "################################################################"
#install postgres
(
sudo apt-get install -y postgresql-9.1 libpq-dev 
sudo apt-get install -y postgis 
sudo apt-get install -y apache2 
) >> provision.log 2>&1

mkdir PKG > /dev/null 2>&1 # we can ignore warnings
sudo chown -R $USER PKG/
cd PKG

if [ -e /opt/tomcat ]; then
	echo "################################################################"
	echo "# Tomcat already installed in /opt/tomcat                       #"
	echo "################################################################"
else
	echo "################################################################"
	echo "# Installing tomcat                                            #"
	echo "################################################################"
	(
	if [ ! -e ${REPO_DIR}/apache-tomcat-7.0.25.tar.gz ]; then 
		wget http://mirror.nohup.it/apache/tomcat/tomcat-7/v7.0.25/bin/apache-tomcat-7.0.25.tar.gz > /dev/null 2>&1
		sudo cp apache-tomcat-7.0.25.tar.gz ${REPO_DIR}/apache-tomcat-7.0.25.tar.gz
	fi
	tar -zxf ${REPO_DIR}/apache-tomcat-7.0.25.tar.gz 
	sudo mv apache-tomcat-7.0.25 /opt/ 

	sudo useradd tomcat
	sudo chown -R tomcat.tomcat /opt/apache-tomcat-7.0.25
	sudo ln -s /opt/apache-tomcat-7.0.25 /opt/tomcat
	) >> provision.log 2>&1

	sudo cat >> tomcat7 << EOF
#! /bin/sh
### BEGIN INIT INFO
# Provides:          tomcat7
# Required-Start:    \$remote_fs \$syslog
# Required-Stop:     \$remote_fs \$syslog
# Should-Start:      \$named
# Default-Start:     2 3 4 5
# Default-Stop:      1
# Short-Description: Tomcat7 Application server
# Description:       Tomcat7
### END INIT INFO

set -e

TOMCAT_HOME="/opt/tomcat/"
DAEMON_START="/opt/tomcat/bin/startup.sh"
DAEMON_STOP="/opt/tomcat/bin/shutdown.sh"
PID_FILE="/var/run/tomcat7.pid"

test -x \$DAEMON || exit 0

. /lib/lsb/init-functions

export PATH="\${PATH:+\$PATH:}/usr/sbin:/sbin"


case "\$1" in
  start)
	    log_daemon_msg "Starting tomcat7 daemon" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_START} && touch \$PID_FILE
	    ;;
  stop)
	    log_daemon_msg "Stopping tomcat7 daemon" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_STOP} && rm -f \$PID_FILE
	    ;;

  reload|force-reload)
	    log_warning_msg "Reloading tomcat7 daemon: please use restart"
	    ;;

  restart)
	    log_daemon_msg "Restarting tomcat7 daemon (it might take a while)" "tomcat7"
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_STOP} && rm -f \$PID_FILE
	    sleep 10
	    cd \$TOMCAT_HOME && /bin/su - tomcat -c \${DAEMON_START} && touch \$PID_FILE
	    ;;

  *)
	    echo "Usage: /etc/init.d/tomcat7 {start|stop|restart}"
	    exit 1
esac

exit 0
EOF

	sudo mv tomcat7 /etc/init.d/tomcat7
	sudo chmod +x /etc/init.d/tomcat7

	cat >> tomcat_cfg << EOF
#!/bin/sh
#
# Global tomcat/java configuration.
# Due to licensing issues you will have to install JDK 1.6 in /opt/jdk MANUALLY
#

if [ -e "/opt/geoserver-gdal-libs/" ]; then
	    export GDAL_DATA="/opt/geoserver-gdal-libs/"
	    export GDAL_DRIVER_PATH="/opt/geoserver-gdal-libs/"
	    export LD_LIBRARY_PATH="/opt/geoserver-gdal-libs/"
	    export PATH="/opt/geoserver-gdal-libs/:\$PATH"
fi

JAVA_HOME="/opt/jdk"
export PATH="\${JAVA_HOME}/bin:\$PATH"
JAVA_OPTS="-Xmx1024M -XX:SoftRefLRUPolicyMSPerMB=36000 -XX:MaxPermSize=128m -XX:+UseParallelGC "

### End of changes
EOF

	sudo cat tomcat_cfg /opt/tomcat/bin/catalina.sh > catalina.sh
	cat catalina.sh | sudo tee /opt/tomcat/bin/catalina.sh  > /dev/null
fi # end of install tomcat

if [ -e /opt/jdk/bin/java ]; then
	echo "################################################################"
	echo "# Java already installed in /opt/jdk                           #"
	echo "################################################################"
else
	echo "################################################################"
	echo "# Installing Java                                              #"
	echo "################################################################"
	# checking for jdk in shared folder
	# check platform spcific jdk
	if [ "$ARCH" == "x86_64" ]; then
		jdk=`ls -1 ${REPO_DIR}/jdk-6*x64*.bin | head -1`
	fi
	if [ "$jdk" == "" ]; then
		jdk=`ls -1 ${REPO_DIR}/jdk-6*.bin | head -1`
	fi
	echo Found $jdk
	if [ -e ${jdk} ]; then
		chmod +x $jdk
		( $jdk -noregister >> provision.log 2>&1 ) || ( echo "Unpacking failed."; exit 1 )
		# find out the full jdk name
		jdk=`ls -1 . | grep jdk1.6* | head -1`
		sudo mv $jdk /opt
		sudo ln -s /opt/$jdk /opt/jdk

		sudo update-rc.d tomcat7 defaults
	else
CAT <<EOF
FATAL: Could not find a JDK to install.
Please download a .bin package from http://www.oracle.com/technetwork/java/javase/index.html
and place it in the shared directory (install-data) so that this script can find it.

Exiting.

EOF
		exit 1
	fi
fi

echo "################################################################"
echo "# Creating postgres database (will fail if exists)             #"
echo "################################################################"
(
cat >> /tmp/db.sh << EEOF
#!/bin/bash
psql -c "create user social with password 'social'";
psql -c "create database social with owner social";
EEOF
sudo chmod 755 /tmp/db.sh
sudo su postgres -c /tmp/db.sh
) >> provision.log 2>&1

echo "################################################################"
echo "# Updating postgres database                                   #"
echo "################################################################"

export JAVA_HOME=/opt/jdk
export PATH=$JAVA_HOME/bin:$PATH

export WARFILE=${REPO_DIR}/mapsocial-0.1.war
if [ ! -e $WARFILE ]; then
	# download from s3
	wget ${REMOTE_REPO}/mapsocial-0.1.war && mv mapsocial-0.1.war ${REPO_DIR}/
fi;

(
# extract driver and changelog from war
unzip -o -j $WARFILE WEB-INF/changelog.xml WEB-INF/lib/liquibase-1.9.3.jar WEB-INF/lib/postgresql-8.3-603.jdbc3.jar
# now run liquibase migration
/opt/jdk/bin/java -jar liquibase-1.9.3.jar --classpath=postgresql-8.3-603.jdbc3.jar --changeLogFile=changelog.xml --driver=org.postgresql.Driver --username=social --password=social --url=jdbc:postgresql:social update

) >> provision.log 2>&1

echo "################################################################"
echo "# Installing/Upgrading backend web app                         #"
echo "################################################################"
(
sudo rm -f /opt/tomcat/webapps/mapsocial.war
sudo cp ${REPO_DIR}/mapsocial-0.1.war /opt/tomcat/webapps/mapsocial.war
sudo chown tomcat.tomcat /opt/tomcat/webapps/mapsocial.war
) >> provision.log 2>&1


echo "################################################################"
echo "# Installing Sproutcore frontend                               #"
echo "################################################################"
(
export SCAPP=${REPO_DIR}/mappu-build-1.0.tgz
if [ ! -e $SCAPP ]; then
        # download from s3
        wget ${REMOTE_REPO}/mappu-build-1.0.tgz && mv mappu-build-1.0.tgz ${REPO_DIR}/
fi;

sudo tar -zxf $SCAPP -C /var/www/
) >> provision.log 2>&1 

echo "################################################################"
echo "# Installing Geoserver                                         #"
echo "################################################################"
(
if [ ! -e ${REPO_DIR}/geoserver-2.1.3-war.zip ]; then
	curl -O -L http://downloads.sourceforge.net/project/geoserver/GeoServer/2.1.3/geoserver-2.1.3-war.zip
	cp geoserver-2.1.3-war.zip ${REPO_DIR}/
fi
unzip ${REPO_DIR}/geoserver-2.1.3-war.zip geoserver.war
sudo mv geoserver.war /opt/tomcat/webapps/geoserver.war
sudo chown tomcat.tomcat /opt/tomcat/webapps/geoserver.war
) >> provision.log 2>&1


echo "################################################################"
echo "# Installing JAI libraries (performance)                       #"
echo "#                                                              #"
echo "# You will have to manually answer Y to accept license         #"
echo "################################################################"
#(
if [ ! -e "${REPO_DIR}/jai*.bin" ]; then
	if [ "$ARCH" == "x86_64" ]; then
		JAI_ARCH=amd64
		wget http://download.java.net/media/jai-imageio/builds/release/1.1/jai_imageio-1_1-lib-linux-amd64-jdk.bin
		wget http://download.java.net/media/jai/builds/release/1_1_3/jai-1_1_3-lib-linux-amd64-jdk.bin
	else
		JAI_ARCH=i586
		wget http://download.java.net/media/jai-imageio/builds/release/1.1/jai_imageio-1_1-lib-linux-i586-jdk.bin
		wget http://download.java.net/media/jai/builds/release/1_1_3/jai-1_1_3-lib-linux-i586-jdk.bin
	fi
	sudo cp jai-1_1_3-lib-linux-${JAI_ARCH}-jdk.bin ${REPO_DIR}/
	sudo cp jai_imageio-1_1-lib-linux-${JAI_ARCH}-jdk.bin ${REPO_DIR}/
fi
sudo cp ${REPO_DIR}/jai-1_1_3-lib-linux-${JAI_ARCH}-jdk.bin /opt/jdk/
sudo cp ${REPO_DIR}/jai_imageio-1_1-lib-linux-${JAI_ARCH}-jdk.bin /opt/jdk/

cd /opt/jdk
echo yes | sudo sh jai-1_1_3-lib-linux-${JAI_ARCH}-jdk.bin
echo yes | sudo _POSIX2_VERSION=199209 sh jai_imageio-1_1-lib-linux-${JAI_ARCH}-jdk.bin
cd -

#) >> provision.log 2>&1

echo "################################################################"
echo "# Configuring apache                                           #"
echo "################################################################"
(
cat > mappu.conf <<EOF
ProxyPass /geoserver ajp://127.0.0.1:8009/geoserver

<Location /geoserver>
Order Allow,Deny
Allow from All
</Location>

<IfModule mod_cache.c>
<IfModule mod_disk_cache.c>
CacheRoot /var/cache/apache2/mod_disk_cache
CacheEnable disk /geoserver/psn/wms
CacheDirLevels 5
CacheDirLength 3
CacheDefaultExpire 3600
</IfModule>
</IfModule>

ProxyPass /mapsocial ajp://127.0.0.1:8009/mapsocial

<Location /mapsocial>
Order Allow,Deny
Allow from All
</Location>

EOF
sudo cp mappu.conf /etc/apache2/conf.d/mappu

sudo a2enmod proxy proxy_ajp
sudo a2enmod cache
sudo a2enmod disk_cache
sudo a2enmod deflate

#sudo /etc/init.d/tomcat7 start

#sudo /etc/init.d/apache2 restart
) >> provision.log 2>&1 

echo ""
echo "Installation completed."
echo ""
exit
