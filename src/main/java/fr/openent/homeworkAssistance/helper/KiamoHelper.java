package fr.openent.homeworkAssistance.helper;
import fr.openent.homeworkAssistance.service.impl.DefaultCallbackService;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.collections.JsonArray;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpClient;
import io.vertx.core.http.HttpClientOptions;
import io.vertx.core.http.HttpClientRequest;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.core.net.ProxyOptions;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.concurrent.atomic.AtomicBoolean;

public class KiamoHelper {

    protected static final Logger log = LoggerFactory.getLogger(DefaultCallbackService.class);
    private HttpClient httpClient;
    private JsonObject body;
    private String url;
    private AtomicBoolean responseIsSent;
    private boolean closeHttpClient;
//    public static final boolean DEFAULT_KEEP_ALIVE = true;

    public KiamoHelper(Vertx vertx, String url, JsonObject body) {
        super();
        log.error("start constructor");
        this.body = body;
        this.httpClient = createHttpClient(vertx, body);
        this.url = url;
        this.responseIsSent = new AtomicBoolean(false);
        this.closeHttpClient = false;
        log.error("end constructor");
    }

    /**
     * Create default HttpClient
     * @return new HttpClient
     */
    public static HttpClient createHttpClient(Vertx vertx, JsonObject config) {
        log.error("start createHttpClient");
        boolean setSsl = true;
        try {
            setSsl = "https".equals(new URI(config.getString("address")).getScheme());
        } catch (URISyntaxException e) {
            log.error("Invalid uri",e);
        }
        final HttpClientOptions options = new HttpClientOptions();
        options.setSsl(setSsl);
        options.setTrustAll(true);
        options.setVerifyHost(false);
        if (System.getProperty("httpclient.proxyHost") != null) {
            ProxyOptions proxyOptions = new ProxyOptions()
                    .setHost(System.getProperty("httpclient.proxyHost"))
                    .setPort(Integer.parseInt(System.getProperty("httpclient.proxyPort")))
                    .setUsername(System.getProperty("httpclient.proxyUsername"))
                    .setPassword(System.getProperty("httpclient.proxyPassword"));
            options.setProxyOptions(proxyOptions);
        }
        int maxPoolSize = config.getInteger("http-client-max-pool-size", 0);
        if(maxPoolSize > 0) {
            options.setMaxPoolSize(maxPoolSize);
        }
        log.error("end createHttpClient");
        return vertx.createHttpClient(options);
    }

    public void sendRequest(Handler<Either<String,Buffer>> handler) {
        log.error("start sendRequest");

        URI uri = null;
        try {
            uri = new URI(this.url);
        } catch (URISyntaxException e) {
            handler.handle(new Either.Left<>("Bad request"));
            return;
        }

        final HttpClientRequest httpClientRequest = httpClient.postAbs(uri.toString(), response -> {
            if (response.statusCode() == 200) {
                final Buffer buff = Buffer.buffer();
                response.handler(event -> buff.appendBuffer(event));
                response.endHandler(end -> {
                    handler.handle(new Either.Right<>(buff));
                    if (KiamoHelper.this.closeHttpClient) {
                        if (!this.responseIsSent.getAndSet(true)) {
                            httpClient.close();
                        }
                    }
                });
            } else {
                log.error("fail to post webservice" + response.statusMessage());
                response.bodyHandler(event -> {
                    log.error("Returning body after POST CALL : " + KiamoHelper.this.url + ", Returning body : " + event.toString("UTF-8"));
                    if (KiamoHelper.this.closeHttpClient) {
                        if (!this.responseIsSent.getAndSet(true)) {
                            httpClient.close();
                        }
                    }
                });
            }
        });

        if (this.body != null) {
            JsonObject params = this.body;
//            params.remove("key");
//            params.remove("ip_server");
//            params.remove("address");
            Object parameters = params.getMap();
            String encodedParameters = "";
            if(parameters instanceof JsonObject) {
                encodedParameters = ((JsonObject) parameters).encode();
            } else if(parameters instanceof JsonArray) {
                encodedParameters = ((JsonArray) parameters).encode();
            } else {
                log.error("unknow parameters format");
                handler.handle(new Either.Left<>("unknow parameters format"));
                return;
            }

            httpClientRequest.write("parameters=").write(encodedParameters);
        }

        httpClientRequest.putHeader("Kiamo-API-Token", this.body.getString("key"));

        httpClientRequest.exceptionHandler(new Handler<Throwable>() {
            @Override
            public void handle(Throwable event) {
                log.error(event.getMessage(), event);
                if (!responseIsSent.getAndSet(true)) {
                    handle(event);
                    httpClient.close();
                }
            }
        }).end();

        log.error("end sendRequest");
    }
}