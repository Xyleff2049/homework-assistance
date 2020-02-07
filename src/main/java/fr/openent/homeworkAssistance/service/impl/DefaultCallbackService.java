package fr.openent.homeworkAssistance.service.impl;

import fr.openent.homeworkAssistance.helper.KiamoHelper;
import fr.openent.homeworkAssistance.service.CallbackService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.json.JsonObject;

public class DefaultCallbackService implements CallbackService {

    @Override
    public void send(JsonObject form, Handler<Either<String, JsonObject>> handler) {
        Vertx vertx = Vertx.vertx();
        String url = form.getString("address");
        Handler<Either<String, Buffer>> handler2 = event -> {
            if (event.isRight()) {
                System.out.println("handler buffer succeed");
            }
            else {
                System.out.println("handler buffer fail");
            }
        };

        new KiamoHelper(vertx, url, form).sendRequest(handler2);
    }
}
