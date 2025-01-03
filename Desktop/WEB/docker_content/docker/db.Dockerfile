FROM postgres:17.2

RUN mkdir -p /home/app

COPY . /home/app 

EXPOSE 3000

VOLUME ["/var/lib/postgresql/data"]

CMD ["postgres"]
