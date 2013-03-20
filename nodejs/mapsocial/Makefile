test:
	java -jar liquibase/liquibase-1.9.3.jar --classpath=liquibase/postgresql-8.3-603.jdbc3.jar --contexts=TEST --changeLogFile=liquibase/changelog.xml --driver=org.postgresql.Driver --username=social_test --password=social --url=jdbc:postgresql:social_test update
	NODE_DB_URL="postgres://social_test:social@localhost/social_test" mocha -R spec

run_test:
	NODE_APP_CONTEXT="/mapsocial" NODE_DB_URL="postgres://social_test:social@localhost/social_test"  nodejs app.js

run_prod:
	NODE_APP_CONTEXT="/mapsocial" NODE_DB_URL="postgres://social:social@localhost/social"  nodejs app.js

.PHONY: test run