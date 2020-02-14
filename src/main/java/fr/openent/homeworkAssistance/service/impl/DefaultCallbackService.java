package fr.openent.homeworkAssistance.service.impl;
import fr.openent.homeworkAssistance.helper.KiamoHelper;
import fr.openent.homeworkAssistance.service.CallbackService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class DefaultCallbackService implements CallbackService {
    private Vertx vertx;

    public DefaultCallbackService(Vertx vertx) {
        this.vertx = vertx;
    }

    @Override
    public void send(JsonObject form, Handler<Either<String, JsonObject>> handler) {
        final Logger log = LoggerFactory.getLogger(DefaultCallbackService.class);
        KiamoHelper kiamoHelper = new KiamoHelper(vertx, form);
        kiamoHelper.sendForm(event -> {
            if (event.succeeded()) {
                log.info("[HomeworkAssistance@Kiamo] Form sent to Kiamo");
                log.info("[HomeworkAssistance@Kiamo] " + event.result().toString());
                handler.handle(new Either.Right(event.result().toJsonObject()));
            } else {
                handler.handle(new Either.Left<>("[HomeworkAssistance@Kiamo] Fail to send the form"));
            }
        });
    }
}