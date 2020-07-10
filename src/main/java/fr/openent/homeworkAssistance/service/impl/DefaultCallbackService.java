package fr.openent.homeworkAssistance.service.impl;
import fr.openent.homeworkAssistance.helper.KiamoHelper;
import fr.openent.homeworkAssistance.service.ICallbackService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class DefaultCallbackService implements ICallbackService {
    private Vertx vertx;
    private JsonObject config;

    public DefaultCallbackService(Vertx vertx, JsonObject config) {
        this.vertx = vertx;
        this.config = config;
    }

    @Override
    public void send(JsonObject form, Handler<Either<String, JsonObject>> handler) {
        final Logger log = LoggerFactory.getLogger(DefaultCallbackService.class);
        KiamoHelper kiamoHelper = new KiamoHelper(vertx, config, form);
        kiamoHelper.sendForm(event -> {
            if (event.succeeded()) {
                log.info("[HomeworkAssistance@Kiamo] Form sent to Kiamo");
                log.info("[HomeworkAssistance@Kiamo] " + event.result().toString());
                handler.handle(new Either.Right(new JsonObject()));
            } else {
                handler.handle(new Either.Left<>("Fail to send the form"));
            }
        });
    }

    @Override
    public void getServices(Handler<Either<String, JsonObject>> handler) {
        JsonObject services = config.getJsonObject("services") != null ? config.getJsonObject("services") : new JsonObject();
        handler.handle(new Either.Right(services));
    }
}