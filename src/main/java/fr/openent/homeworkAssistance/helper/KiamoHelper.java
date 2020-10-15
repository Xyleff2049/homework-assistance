package fr.openent.homeworkAssistance.helper;
import fr.openent.homeworkAssistance.service.impl.DefaultCallbackService;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientOptions;
import io.vertx.core.http.HttpClientRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.net.ProxyOptions;
import org.entcore.common.controller.ControllerHelper;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.*;

public class KiamoHelper extends ControllerHelper {

    protected static final Logger log = LoggerFactory.getLogger(DefaultCallbackService.class);
    private HttpClient httpClient;
    private JsonObject body;
    private String url;
    private JsonObject config;


    public KiamoHelper(Vertx vertx, JsonObject config, JsonObject body) {
        super();
        this.body = body;
        this.config = config;
        generateUrl();
        setHost(vertx);
    }

    private void generateUrl() {
        if (this.config.getJsonObject("kiamo") != null) {
            try {
                String server = this.config.getJsonObject("kiamo").getString("server");
                String service = this.body.getJsonObject("userdata").getValue("service").toString();
                String key = this.config.getJsonObject("kiamo").getString("key");

                this.url = server + "/api/services/" + service + "/tasks?token=" + key;
            }
            catch (Exception e) {
                log.error("[HomeworkAssistance@Kiamo] Fail to create url", e);
            }
        }
    }

    public void setHost(Vertx vertx) {
        try {
            URI uri = new URI(this.url);

            HttpClientOptions options = new HttpClientOptions()
                    .setSsl("https".equals(uri.getScheme()))
                    .setKeepAlive(true)
                    .setVerifyHost(false)
                    .setTrustAll(true);

            if (config.getJsonObject("proxy") != null) {
                ProxyOptions proxyOptions = new ProxyOptions()
                        .setHost(config.getJsonObject("proxy").getString("host"))
                        .setPort(config.getJsonObject("proxy").getInteger("port"));
                options.setProxyOptions(proxyOptions);
            }

            this.httpClient = vertx.createHttpClient(options);
        }
        catch (URISyntaxException e) {
            log.error("[HomeworkAssistance@Kiamo] Wrong URI : " + this.url, e);
        }
    }

    public void sendForm(Handler<AsyncResult<Buffer>> handler) {
        URI uri = null;
        try {
            uri = new URI(this.url);
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }

        Future<Buffer> future = Future.future();
        future.setHandler(handler);

        HttpClientRequest request = httpClient.postAbs(uri.toString(), response -> {
            if (response.statusCode() == 201) {
                final Buffer buff = Buffer.buffer();
                response.bodyHandler(buff::appendBuffer);
                response.handler(event -> {
                    buff.appendBuffer(event);
                    httpClient.close();
                });
                response.endHandler(end -> handler.handle(Future.succeededFuture(buff)));
            } else {
                log.error("[HomeworkAssistance@Kiamo] Fail to post webservice : " + response.toString());
                response.bodyHandler(event -> {
                    response.endHandler(end -> handler.handle(Future.failedFuture(response.toString())));
                });
            }
        });

        request.exceptionHandler(event -> {
            log.error(event.getMessage(), event.getCause());
            handler.handle(Future.failedFuture(event.getMessage()));
        });

        request.setChunked(true);

        JsonArray parameters = mapBody(this.body);
        String encodedParameters = parameters.encode();

        request.write(encodedParameters);
        request.putHeader("Kiamo-Api-Token", this.config.getJsonObject("kiamo").getString("key"));
        request.putHeader("Content-type", "application/json");
        request.putHeader("Content-Length", String.valueOf(encodedParameters.length()));
        request.end();
    }

    private JsonArray mapBody(JsonObject body) {
        JsonObject userdata = body.getJsonObject("userdata");
        JsonObject exportedBody = new JsonObject();

        exportedBody.put("destination", body.getString("destination"));

        // Parse callback_date
        String dateTime = body.getString("callback_date").substring(0, 11) +
                body.getJsonObject("callback_time").getValue("hour") + ":" +
                body.getJsonObject("callback_time").getInteger("minute") + ":00" +
                OffsetTime.ofInstant(Instant.now(), ZoneId.of("Europe/Paris")).getOffset(); // Give local UTC offset
        exportedBody.put("callback_date", dateTime);

        // Map userdata
        JsonObject exportedData = new JsonObject();
        exportedData.put("prenom_eleve", userdata.getString("prenom"));
        exportedData.put("nom_eleve", userdata.getString("nom"));
        exportedData.put("etablissement", userdata.getString("etablissement"));
        exportedData.put("classe", userdata.getString("classe"));
        exportedData.put("matiere_aide", userdata.getString("matiere"));
        exportedData.put("informations_complementaires", body.getString("informations_complementaires"));
        exportedBody.put("userdata", exportedData);

        return new JsonArray().add(exportedBody);
    }
}