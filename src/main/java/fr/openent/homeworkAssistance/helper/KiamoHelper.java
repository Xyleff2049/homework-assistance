package fr.openent.homeworkAssistance.helper;
import fr.openent.homeworkAssistance.service.impl.DefaultCallbackService;
import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpClientResponse;
import io.vertx.core.json.JsonObject;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientOptions;
import io.vertx.core.http.HttpClientRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.controller.ControllerHelper;
import java.net.URI;
import java.net.URISyntaxException;

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
            String address = this.config.getJsonObject("kiamo").getString("server");
            String service = this.body.getJsonObject("userdata").getString("service");
            String key = this.config.getJsonObject("kiamo").getString("key");

            this.url = address + service + "/tasks?token=" + key;
        }
    }

    /**
     * Create default HttpClient
     * @return new HttpClient
     */
    public void setHost(Vertx vertx) {
        try {
            URI uri = new URI(this.url);
            HttpClientOptions opts = new HttpClientOptions()
                    .setDefaultHost(this.url)
                    .setDefaultPort("https".equals(uri.getScheme()) ? 443 : 80)
                    .setSsl("https".equals(uri.getScheme()))
                    .setKeepAlive(true)
                    .setVerifyHost(false)
                    .setTrustAll(true);
            this.httpClient = vertx.createHttpClient(opts);
        } catch (URISyntaxException e) {
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
                log.error("[HomeworkAssistance@Kiamo] Fail to post webservice : " + response.statusMessage());
                response.bodyHandler(event -> {
                });
            }
        });

        request.exceptionHandler(event -> {
            log.error(event.getMessage(), event.getCause());
        });

        request.putHeader("Kiamo-API-Token", this.config.getJsonObject("kiamo").getString("key"));
        request.putHeader("Content-type", "application/x-www-form-urlencoded");

        if (this.body != null) {
            request.setChunked(true);

            JsonObject parameters = this.body;
            String encodedParameters = parameters.encode();

            request.write("parameters=").write(encodedParameters);
        }
        request.end();
    }
}