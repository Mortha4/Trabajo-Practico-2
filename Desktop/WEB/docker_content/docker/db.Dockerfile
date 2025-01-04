FROM postgres:17.2

RUN mkdir -p /home/app

EXPOSE 5432

VOLUME ["/var/lib/postgresql/data"]

CMD ["postgres"]

