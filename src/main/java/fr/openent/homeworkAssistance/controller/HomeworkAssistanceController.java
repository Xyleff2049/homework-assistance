package fr.openent.homeworkAssistance.controller;

import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;


public class HomeworkAssistanceController extends ControllerHelper {

    public HomeworkAssistanceController() {
        super();
    }

    @Get("")
    @SecuredAction("authenticated")
    public void view (HttpServerRequest request) {
        renderView(request, new JsonObject());
    }
}
