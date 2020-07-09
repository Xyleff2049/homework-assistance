package fr.openent.homeworkAssistance.service;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

public interface ICallbackService {

    /**
     * send data to Kiamo
     */
    void send(JsonObject form, Handler<Either<String, JsonObject>> handler);

    /**
     * get services names and keys
     */
    void getServices(Handler<Either<String, JsonObject>> handler);

}
